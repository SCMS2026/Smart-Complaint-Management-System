import React, { useEffect, useState } from "react";
import { getComplaintById, updateComplaintStatusRequest, markComplaintAsFake, addCommentToComplaint } from "../services/complaints";

const ComplaintDetail = ({ complaintId, onClose, onStatusChange }) => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const loadComplaint = async () => {
      const res = await getComplaintById(complaintId);
      if (res.success) {
        setComplaint(res.complaint);
      } else {
        setError(res.message || "Failed to load complaint");
      }
      setLoading(false);
    };
    loadComplaint();
  }, [complaintId]);

  const handleVerify = async () => {
    const res = await updateComplaintStatusRequest(complaintId, "verified");
    if (res.success) {
      setComplaint(res.complaint);
      onStatusChange?.();
    } else {
      setError(res.message || "Failed to verify complaint");
    }
  };

  const handleMarkAsFake = async () => {
    const res = await markComplaintAsFake(complaintId);
    if (res.success) {
      setComplaint(res.complaint);
      onStatusChange?.();
    } else {
      setError(res.message || "Failed to mark as fake");
    }
  };

  const handleRequestMoreInfo = async () => {
    const res = await updateComplaintStatusRequest(complaintId, "waiting_user");
    if (res.success) {
      setComplaint(res.complaint);
      onStatusChange?.();
    } else {
      setError(res.message || "Failed to request more info");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    const res = await addCommentToComplaint(complaintId, commentText);
    if (res.success) {
      setComplaint(res.complaint);
      setCommentText("");
    } else {
      setError(res.message || "Failed to add comment");
    }
    setSubmittingComment(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Loading complaint...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>{error || "Complaint not found"}</p>
          <button onClick={onClose} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 my-8">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Verify Complaint</h2>
          <button
            onClick={onClose}
            className="text-2xl font-light hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Complaint Details */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Complaint ID:</strong> {complaint._id?.slice(-6) || "—"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>User:</strong> {complaint.userId?.name || "—"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Location:</strong> {complaint.location || "—"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Issue:</strong> {complaint.issue || "—"}
            </p>
            <p className="text-gray-700">
              <strong>Description:</strong> {complaint.description}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Status:</strong> <span className="capitalize font-semibold">{complaint.status}</span>
            </p>
          </div>

          {/* Image Display */}
          {complaint.image && (
            <div className="mt-4">
              <img
                src={complaint.image}
                alt="complaint"
                className="w-full max-h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Action Buttons */}
          {complaint.status !== "verified" && complaint.status !== "rejected" && (
            <div className="flex gap-2 mt-6 flex-wrap">
              <button
                onClick={handleVerify}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
              >
                ✓ Verify Complaint
              </button>
              <button
                onClick={handleMarkAsFake}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
              >
                ✗ Mark as Fake
              </button>
              <button
                onClick={handleRequestMoreInfo}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
              >
                ❓ Request More Info
              </button>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-bold mb-4">Comments</h3>
            
            {complaint.comments && complaint.comments.length > 0 && (
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                {complaint.comments.map((comment, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 p-3 rounded"
                  >
                    <p className="text-sm font-semibold text-gray-700">
                      {comment.userId?.name || "Anonymous"}
                    </p>
                    <p className="text-gray-600 text-sm">{comment.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-2">
              <textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full border px-3 py-2 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                rows="3"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-semibold transition"
                >
                  {submittingComment ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;