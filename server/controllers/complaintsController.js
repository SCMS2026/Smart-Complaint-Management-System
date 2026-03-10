const Complaint = require('../models/complaintsModel');

const createComplaint = async (req, res) => {
    try {
        const { assetId, description, image, issue, location } = req.body;
        
        // Use authenticated user ID from JWT token
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        
        // Validate required fields
        if (!issue || !location || !description) {
            return res.status(400).json({ message: 'Missing required fields: issue, location, description' });
        }
        
        const newComplaint = new Complaint({
            userId,
            assetId: assetId || null,
            issue,
            location,
            description,
            image: image || null
        });
        console.log('Creating complaint with data:', newComplaint);
        await newComplaint.save();
        res.status(201).json({ message: 'Complaint created successfully', complaint: newComplaint },token);
    } catch (error) {
        console.error('Error creating complaint:', error);
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

const getComplaintById = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const complaint = await Complaint.findById(complaintId)
            .populate('userId', 'name email')
            .populate('assetId', 'name location category');
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        res.status(200).json({ complaint });
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({ message: 'Error fetching complaint', error: error.message });
    }
}

const addComment = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { text } = req.body;
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Comment text is required' });
        }
        
        const complaint = await Complaint.findByIdAndUpdate(
            complaintId,
            {
                $push: {
                    comments: {
                        userId,
                        text,
                        createdAt: new Date()
                    }
                },
                updatedAt: new Date()
            },
            { new: true }
        ).populate('userId', 'name').populate('comments.userId', 'name');
        
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        res.status(200).json({ message: 'Comment added successfully', complaint });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
}

const markAsFake = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const complaint = await Complaint.findByIdAndUpdate(
            complaintId,
            { isFake: true, status: 'rejected', updatedAt: new Date() },
            { new: true }
        ).populate('userId', 'name');
        
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        res.status(200).json({ message: 'Complaint marked as fake', complaint });
    } catch (error) {
        console.error('Error marking complaint as fake:', error);
        res.status(500).json({ message: 'Error marking complaint as fake', error: error.message });
    }
}

module.exports = {
    createComplaint,
    getComplaints,
    updateComplaintStatus,
    deleteComplaint,
    getComplaintById,
    addComment,
    markAsFake
}