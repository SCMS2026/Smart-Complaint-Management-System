const nodemailer = require('nodemailer');
const Notification = require('../models/notificationModel');
const User = require('../models/authModels');

// Email transporter configuration
const createTransporter = async () => {
  // Check if we have email configuration
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };

  // If no SMTP configured, use ethereal for testing or disable email
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not configured. Email notifications disabled.');
    return null;
  }

  return nodemailer.createTransport(emailConfig);
};

// Email templates
const emailTemplates = {
  complaint_created: (data) => ({
    subject: `🆕 New Complaint Received - #${data.complaintId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Complaint Assigned to Your Department</h2>
        <p>A new complaint has been created and assigned to your department.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Complaint Details:</h3>
          <p><strong>Issue:</strong> ${data.issue}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Description:</strong> ${data.description}</p>
          <p><strong>Priority:</strong> ${data.priority || 'Normal'}</p>
        </div>
        <p>Please take appropriate action.</p>
        <a href="${data.actionUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Complaint
        </a>
      </div>
    `
  }),

  complaint_assigned: (data) => ({
    subject: `📋 Complaint Assigned to You - #${data.complaintId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New Assignment</h2>
        <p>A complaint has been assigned to you for resolution.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Assignment Details:</h3>
          <p><strong>Issue:</strong> ${data.issue}</p>
          <p><strong>Department:</strong> ${data.department}</p>
          <p><strong>Priority:</strong> ${data.priority || 'Normal'}</p>
          <p><strong>Assigned By:</strong> ${data.assignedBy}</p>
        </div>
        <a href="${data.actionUrl}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Start Working
        </a>
      </div>
    `
  }),

  status_updated: (data) => ({
    subject: `🔄 Status Updated - #${data.complaintId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Status Change Notification</h2>
        <p>The status of complaint #${data.complaintId} has been updated.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Old Status:</strong> ${data.oldStatus}</p>
          <p><strong>New Status:</strong> ${data.newStatus}</p>
          <p><strong>Updated By:</strong> ${data.updatedBy}</p>
          ${data.comment ? `<p><strong>Comment:</strong> ${data.comment}</p>` : ''}
        </div>
        <a href="${data.actionUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Complaint
        </a>
      </div>
    `
  }),

  user_approval_required: (data) => ({
    subject: `✅ Action Required: Confirm Resolution - #${data.complaintId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Resolution Complete - Your Action Required</h2>
        <p>The work on your complaint has been completed. Please review and confirm.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Complaint Summary:</h3>
          <p><strong>Issue:</strong> ${data.issue}</p>
          <p><strong>Resolved By:</strong> ${data.resolvedBy}</p>
          <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Please confirm if the issue has been resolved:</p>
        <div style="display: flex; gap: 10px; margin: 20px 0;">
          <a href="${data.approveUrl}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            ✅ Approve
          </a>
          <a href="${data.rejectUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            ❌ Reject
          </a>
        </div>
        <p>Or <a href="${data.actionUrl}">view full details</a> to add comments.</p>
      </div>
    `
  }),

  sla_breach_imminent: (data) => ({
    subject: `⚠️ SLA Deadline Approaching - #${data.complaintId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">SLA Deadline Approaching</h2>
        <p>The Service Level Agreement deadline for complaint #${data.complaintId} is approaching.</p>
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
          <p><strong>Issue:</strong> ${data.issue}</p>
          <p><strong>Current Status:</strong> ${data.status}</p>
          <p><strong>Time Remaining:</strong> ${data.timeRemaining}</p>
          <p><strong>SLA Deadline:</strong> ${new Date(data.slaDeadline).toLocaleString()}</p>
        </div>
        <p>Please ensure timely resolution to maintain service quality.</p>
        <a href="${data.actionUrl}" style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Take Action
        </a>
      </div>
    `
  }),

  sla_breached: (data) => ({
    subject: `❌ SLA Breached - #${data.complaintId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">SLA Breach Alert</h2>
        <p>The Service Level Agreement deadline for complaint #${data.complaintId} has been exceeded.</p>
        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Issue:</strong> ${data.issue}</p>
          <p><strong>Current Status:</strong> ${data.status}</p>
          <p><strong>SLA Deadline:</strong> ${new Date(data.slaDeadline).toLocaleString()}</p>
          <p><strong>Overdue By:</strong> ${data.overdueBy}</p>
        </div>
        <p>This complaint requires immediate escalation and attention.</p>
        <a href="${data.actionUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Complaint
        </a>
      </div>
    `
  })
};

// Create notification in database
const createNotification = async (recipientId, senderId, type, title, message, data = {}) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      data,
      actionUrl: data.actionUrl || `/complaint/${data.complaintId}`
    });
    await notification.save();

    // Populate for return
    const populated = await notification
      .populate('sender', 'name profileImage')
      .populate('recipient', 'name email');

    return populated;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return null;
  }
};

// Send email notification
const sendEmailNotification = async (transporter, recipient, templateData) => {
  if (!transporter) return;

  try {
    const user = await User.findById(recipient).select('name email');
    if (!user || !user.email) return;

    const template = emailTemplates[templateData.type];
    if (!template) return;

    const { subject, html } = template(templateData);

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Smart Complaint System" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${user.email}: ${subject}`);
    return result;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return null;
  }
};

// Notify helper - creates notification + sends email
const notify = async (options) => {
  const {
    recipientId,
    senderId,
    type,
    title,
    message,
    data = {},
    sendEmail = true
  } = options;

  // Create in-app notification
  const notification = await createNotification(
    recipientId,
    senderId,
    type,
    title,
    message,
    data
  );

  if (!notification) return null;

  // Send email if configured
  if (sendEmail && process.env.SMTP_USER) {
    const transporter = await createTransporter();
    if (transporter) {
      await sendEmailNotification(transporter, recipientId, {
        type,
        complaintId: data.complaintId,
        issue: data.issue || 'N/A',
        description: data.description,
        priority: data.priority,
        actionUrl: `${process.env.CLIENT_URL || 'http://localhost:5174'}/complaint/${data.complaintId}`,
        ...data
      });

      notification.emailSent = true;
      notification.emailSentAt = new Date();
      await notification.save();
    }
  }

  return notification;
};

// Bulk notify multiple recipients
const bulkNotify = async (recipientIds, senderId, type, title, message, data = {}) => {
  const notifications = [];
  for (const recipientId of recipientIds) {
    const notification = await notify({
      recipientId,
      senderId,
      type,
      title,
      message,
      data
    });
    if (notification) notifications.push(notification);
  }
  return notifications;
};

// Get unread count
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    recipient: userId,
    read: false
  });
};

module.exports = {
  notify,
  bulkNotify,
  createNotification,
  getUnreadCount,
  createTransporter,
  emailTemplates
};
