const Complaint = require('../models/complaintsModel');
const User = require('../models/authModels');
const Department = require('../models/departmentModel');
const { notify } = require('../services/notificationService');
const cron = require('node-cron');

/**
 * SLA Monitoring Service
 * Checks for approaching and breached SLAs every hour
 */
const slaMonitor = {

  // Main check - runs every hour
  start() {
    if (process.env.NODE_ENV === 'development') {
      // In development, run every minute INSTEAD of hourly (not in addition to)
      cron.schedule('* * * * *', async () => {
        console.log('⏰ [Dev] Running SLA check...');
        await this.checkAllComplaints();
      });
    } else {
      // Run every hour at minute 0 in production
      cron.schedule('0 * * * *', async () => {
        console.log('⏰ Running SLA check...');
        await this.checkAllComplaints();
      });
    }

    console.log('✅ SLA Monitoring started');
  },

  async checkAllComplaints() {
    try {
      const now = new Date();
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Find complaints that are at risk (deadline within 24h)
      const atRiskComplaints = await Complaint.find({
        status: { $in: ['pending', 'verified', 'assigned', 'in_progress'] },
        slaStatus: 'on_track',
        slaDeadline: { $lte: oneDayFromNow, $gt: now },
        escalated: false
      }).populate('userId').populate('department_id').populate('assignedTo');

      for (const complaint of atRiskComplaints) {
        await this.handleAtRisk(complaint);
      }

      // Find breached complaints (past deadline, not yet marked as breached)
      const breachedComplaints = await Complaint.find({
        status: { $in: ['pending', 'verified', 'assigned', 'in_progress'] },
        slaDeadline: { $lte: now },
        slaStatus: { $ne: 'breached' }
      }).populate('userId').populate('department_id').populate('assignedTo');

      for (const complaint of breachedComplaints) {
        await this.handleBreach(complaint);
      }

    } catch (error) {
      console.error('SLA monitoring error:', error);
    }
  },

  async handleAtRisk(complaint) {
    console.log(`⚠️ Complaint #${complaint._id} approaching SLA deadline`);

    // Mark as at_risk
    await Complaint.findByIdAndUpdate(complaint._id, {
      slaStatus: 'at_risk'
    });

    // Notify assigned worker
    if (complaint.assignedTo) {
      await notify({
        recipientId: complaint.assignedTo._id,
        senderId: complaint.userId._id,
        type: 'sla_breach_imminent',
        title: 'SLA Deadline Approaching',
        message: `Complaint "${complaint.issue}" needs to be resolved within 24 hours to meet SLA.`,
        data: {
          complaintId: complaint._id,
          issue: complaint.issue,
          status: complaint.status,
          timeRemaining: '24 hours',
          slaDeadline: complaint.slaDeadline,
          actionUrl: `/complaint/${complaint._id}`
        }
      });
    }

    // Also notify department admin
    if (complaint.department_id?.admin) {
      await notify({
        recipientId: complaint.department_id.admin,
        senderId: complaint.userId._id,
        type: 'sla_breach_imminent',
        title: 'SLA Deadline Approaching',
        message: `Complaint "${complaint.issue}" in your department is approaching its SLA deadline.`,
        data: {
          complaintId: complaint._id,
          issue: complaint.issue,
          status: complaint.status,
          slaDeadline: complaint.slaDeadline,
          actionUrl: `/complaint/${complaint._id}`
        }
      });
    }
  },

  async handleBreach(complaint) {
    console.log(`❌ Complaint #${complaint._id} has breached SLA`);

    // Mark as breached
    await Complaint.findByIdAndUpdate(complaint._id, {
      slaStatus: 'breached',
      escalated: true,
      escalatedAt: new Date(),
      escalationCount: complaint.escalationCount + 1
    });

    // Escalate to super admin
    const superAdmins = await User.find({ role: 'super_admin' });
    for (const admin of superAdmins) {
      await notify({
        recipientId: admin._id,
        senderId: complaint.userId._id,
        type: 'sla_breached',
        title: 'SLA Breached - Immediate Action Required',
        message: `Complaint "${complaint.issue}" has exceeded its SLA deadline.`,
        data: {
          complaintId: complaint._id,
          issue: complaint.issue,
          status: complaint.status,
          slaDeadline: complaint.slaDeadline,
          overdueBy: this.getOverdueTime(complaint.slaDeadline),
          actionUrl: `/complaint/${complaint._id}`,
          priority: 'high'
        }
      });
    }

    // Also notify department admin & worker
    if (complaint.assignedTo) {
      await notify({
        recipientId: complaint.assignedTo._id,
        senderId: complaint.userId._id,
        type: 'sla_breached',
        title: 'SLA Breached - Action Required',
        message: `You have exceeded the SLA for complaint "${complaint.issue}". Please resolve immediately.`,
        data: {
          complaintId: complaint._id,
          issue: complaint.issue,
          actionUrl: `/complaint/${complaint._id}`
        }
      });
    }

    if (complaint.department_id?.admin) {
      await notify({
        recipientId: complaint.department_id.admin,
        senderId: complaint.userId._id,
        type: 'sla_breached',
        title: 'SLA Breached in Your Department',
        message: `A complaint in your department has breached its SLA.`,
        data: {
          complaintId: complaint._id,
          issue: complaint.issue,
          actionUrl: `/complaint/${complaint._id}`
        }
      });
    }
  },

  getOverdueTime(slaDeadline) {
    const now = new Date();
    const diffMs = now - new Date(slaDeadline);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours} hours`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  },

  // Manual trigger - for admin to recalculate SLAs
  async recalculateAll() {
    const complaints = await Complaint.find({
      status: { $in: ['pending', 'verified', 'assigned', 'in_progress'] }
    });

    for (const complaint of complaints) {
      await this.recalculateSLA(complaint);
    }

    return { success: true, count: complaints.length };
  },

  async recalculateSLA(complaint) {
    // Re-calculate SLA based on current priority and department settings
    let slaDays = 3;
    if (complaint.department_id) {
      const dept = await Department.findById(complaint.department_id).select('settings');
      if (dept?.settings?.priorityThreshold) {
        slaDays = dept.settings.priorityThreshold;
      }
    }

    const priorityMultiplier = {
      low: 1.5,
      medium: 1.0,
      high: 0.7,
      critical: 0.5
    };
    const finalSlaDays = Math.ceil(slaDays * (priorityMultiplier[complaint.priority] || 1));

    // Set from createdAt + SLA days
    const createdAt = complaint.createdAt || complaint._id.getTimestamp();
    const newDeadline = new Date(createdAt);
    newDeadline.setDate(newDeadline.getDate() + finalSlaDays);

    await Complaint.findByIdAndUpdate(complaint._id, {
      slaDeadline: newDeadline
    });

    return newDeadline;
  }
};

module.exports = slaMonitor;