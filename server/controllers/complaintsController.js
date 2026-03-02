const Complaint = require('../models/complaintsModel');

const createComplaint = async (req, res) => {
    try {
        const { userId, assetId, description, image } = req.body;
        const newComplaint = new Complaint({
            userId,
            assetId,
            description,
            image
        });
        await newComplaint.save();
        res.status(201).json({ message: 'Complaint created successfully', complaint: newComplaint });
    } catch (error) {
        res.status(500).json({ message: 'Error creating complaint', error: error.message });
    }
}


const getComplaints = async (req, res) => {
    try {
        // filter by role: regular users only see their own complaints
        const filter = {};
        if (req.user && req.user.role === 'user') {
            filter.userId = req.user.id;
        }
        const complaints = await Complaint.find(filter)
            .populate('userId', 'name')
            .populate('assetId', 'name');
        res.status(200).json({ complaints });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complaints', error: error.message });
    }
}

const updateComplaintStatus = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { status } = req.body;
        const updatedComplaint = await Complaint.findByIdAndUpdate(complaintId, { status, updatedAt: Date.now() }, { new: true });
        if (!updatedComplaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        res.status(200).json({ message: 'Complaint status updated successfully', complaint: updatedComplaint });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating complaint status', error: error.message });
    }
}

const deleteComplaint = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const deletedComplaint = await Complaint.findByIdAndDelete(complaintId);
        if (!deletedComplaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        res.status(200).json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating complaint status', error: error.message });
    }
}

module.exports = {
    createComplaint,
    getComplaints,
    updateComplaintStatus,
    deleteComplaint
}