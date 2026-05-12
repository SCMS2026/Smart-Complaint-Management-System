import React, { useState, useEffect } from "react";
import { getComplaintById, getWorkerTasksForComplaint, updateComplaintStatusRequest, markComplaintAsFake, addCommentToComplaint, userApproveComplaintRequest } from "../services/complaints";
import WorkerPhotos from "../components/WorkerPhotos";
import { useTheme } from "../context/ThemeContext";
import {
  AlertTriangle,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Clock2,
  FileText,
  HelpCircle,
  Image,
  MapPin,
  MessageCircle,
  Search,
  X,
  XCircle,
  ThumbsDown,
  ThumbsUp,
  Wrench,
} from "lucide-react";


const ComplaintDetail = ({ complaintId, onClose, onStatusChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [user, setUser] = useState(null);
  const [workerTasks, setWorkerTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);


  useEffect(() => {
    const userFromStorage = JSON.parse(localStorage.getItem("user") || "null");
    setUser(userFromStorage);

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

  // Load worker tasks for relevant statuses
  const isComplaintOwner = () => {
    if (!user || !complaint?.userId) return false;
    const ownerId = complaint.userId._id?.toString?.() || complaint.userId.toString?.();
    const currentUserId = user._id?.toString?.() || user.id?.toString?.();
    return ownerId && currentUserId && ownerId === currentUserId;
  };

  const hasPhotoTasks = workerTasks.some(task => task.before_photo || task.after_photo);

  useEffect(() => {
    if (!complaint?._id) return;

    const loadWorkerTasks = async () => {
      setLoadingTasks(true);
      try {
        const res = await getWorkerTasksForComplaint(complaint._id);
        if (res.success) {
          setWorkerTasks(res.workerTasks || []);
        }
      } catch (err) {
        console.error('Failed to load worker tasks:', err);
      } finally {
        setLoadingTasks(false);
      }
    };

    loadWorkerTasks();
  }, [complaint?._id]);


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

  const handleUserApproval = async (action) => {
    const res = await userApproveComplaintRequest(complaintId, action);
    if (res.success) {
      setComplaint(res.complaint);
      onStatusChange?.();
    } else {
      setError(res.message || "Failed to submit user approval");
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

  const SectionHeader = ({ icon: Icon, title, color }) => (
    <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
      <div className={`p-1.5 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
    </div>
  );

  const FieldRow = ({ label, value, icon: Icon, monospace = false, fullWidth = false }) => (
    <div className={`${fullWidth ? 'col-span-2' : ''}`}>
      <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <div className="flex items-start gap-2">
        {Icon && <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-60" />}
        <p className={`text-sm ${monospace ? 'font-mono' : ''} ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          {value || "—"}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl p-8 shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Loading complaint details…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`rounded-2xl p-8 shadow-2xl max-w-md ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-700" />
            </div>
            <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Error</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6`}>{error || "Complaint not found"}</p>
            <button 
              onClick={onClose}
              className={`px-6 py-2.5 rounded-xl font-semibold transition ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`rounded-4xl shadow-[0_32px_120px_rgba(15,23,42,0.18)] w-full max-w-4xl sm:max-w-5xl mx-4 sm:mx-auto my-4 sm:my-10 overflow-hidden border ${isDark ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        {/* Header */}
        <div className={`px-6 py-5 flex items-center justify-between shadow-sm ${isDark ? 'bg-linear-to-r from-slate-900 to-slate-800 border-b border-slate-700' : 'bg-linear-to-r from-slate-900 to-slate-800 border-b border-slate-700'}`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Complaint Details</h2>
              <p className="text-xs text-slate-300 mt-0.5">#{complaint._id?.slice(-6)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-white/10 text-slate-100 hover:bg-white/20 transition shadow-sm" aria-label="Close details">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className={`px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 ${getStatusColor(complaint.status)}`}>
              {getStatusIcon(complaint.status)}
              <span className="capitalize">{complaint.status.replace(/_/g, ' ')}</span>
            </div>
            {complaint.isFake && (
              <div className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-100 text-red-700 border border-red-300 inline-flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Marked as Fake</span>
              </div>
            )}
          </div>

          {/* Basic Info Section */}
          <section>
            <SectionHeader icon={FileTextIcon} title="Basic Information" color="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRow label="Category" value={complaint.category} />
              <FieldRow label="Issue" value={complaint.issue} icon={AlertIcon} />
              <FieldRow label="Description" value={complaint.description} fullWidth />
            </div>
          </section>

          {/* Location Section */}
          <section>
            <SectionHeader icon={MapPinIcon} title="Location Details" color="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FieldRow label="City" value={complaint.city} />
              <FieldRow label="District" value={complaint.District} />
              <FieldRow label="Taluka" value={complaint.Taluka} />
              <FieldRow label="Village" value={complaint.village} />
              <FieldRow label="Pincode" value={complaint.pincode} monospace />
              <FieldRow label="Specific Location" value={complaint.location} fullWidth />
            </div>
          </section>

          {/* Asset & Department */}
          <section>
            <SectionHeader icon={BuildingIcon} title="Asset & Department" color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRow 
                label="Asset" 
                value={complaint.assetId?.name ? `${complaint.assetId.name} (${complaint.assetId.category || 'N/A'})` : "—"} 
              />
              <FieldRow 
                label="Department" 
                value={complaint.department_id?.name || "—"} 
              />
              <FieldRow 
                label="Assigned To" 
                value={complaint.assignedTo?.name || "—"} 
              />
            </div>
          </section>

          {/* People & Dates */}
          <section>
            <SectionHeader icon={CalendarIcon} title="Timeline & People" color="bg-violet-500/10 text-violet-600 dark:text-violet-400" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRow label="Submitted By" value={complaint.userId?.name || "—"} />
              <FieldRow label="User Email" value={complaint.userId?.email || "—"} />
              <FieldRow label="User Phone" value={complaint.userId?.phone || "—"} />
              <FieldRow 
                label="Created" 
                value={complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : "—"} 
              />
              <FieldRow 
                label="Last Updated" 
                value={complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleString() : "—"} 
              />
            </div>
          </section>

          {/* Image Preview */}
          {complaint.image && (
            <section>
              <SectionHeader icon={ImageIcon} title="Attachment" color="bg-pink-500/10 text-pink-600 dark:text-pink-400" />
              <div className="mt-2">
                <img
                  src={complaint.image}
                  alt="Complaint attachment"
                  className="w-full max-h-96 object-contain rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
            </section>
          )}

           {/* Worker Resolution Photos */}
           {((['admin','super_admin','department_admin'].includes(user?.role) || isComplaintOwner()) && (loadingTasks || hasPhotoTasks)) && (
             <section>
               <SectionHeader 
                 icon={() => <Camera className="w-4 h-4" />} 
                 title="Worker Resolution Photos" 
                 color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
               />
                {loadingTasks ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">Loading photos...</span>
                  </div>
                ) : hasPhotoTasks ? (
                  <WorkerPhotos tasks={workerTasks} isDark={isDark} />
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 py-3">No before/after photos have been uploaded yet.</p>
                )}
             </section>
           )}


          {/* Comments Section */}
          <section>
            <SectionHeader icon={CommentsIcon} title="Comments" color="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" />
            {complaint.comments && complaint.comments.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {complaint.comments.map((comment, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50 border border-slate-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {comment.userId?.name || "Anonymous"}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{comment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} italic py-4`}>No comments yet</p>
            )}

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mt-4 space-y-3">
              <textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isDark ? 'bg-slate-700 border border-slate-600 text-slate-200' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                rows="3"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {submittingComment ? "Submitting…" : "Submit Comment"}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Action Buttons */}
        <div className={`mt-6 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          {user?.role === "user" && complaint.status === "completed" && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleUserApproval("approve")}
                className="flex-1 min-w-[160px] px-4 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Completion
              </button>
              <button
                onClick={() => handleUserApproval("reject")}
                className="flex-1 min-w-[160px] px-4 py-2.5 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                <X className="w-4 h-4" />
                Reject Completion
              </button>
            </div>
          )}
          {user?.role === "user" && complaint.status === "user_approval_pending" && (
            <div className="w-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-lg flex items-center gap-3">
              <Clock2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Your approval is pending for this completed complaint</span>
            </div>
          )}
          {complaint.status !== "verified" && complaint.status !== "rejected" && complaint.status !== "user_approval_pending" && user?.role !== "user" && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleVerify}
                className="flex-1 min-w-[140px] px-4 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                Verify
              </button>
              <button
                onClick={handleMarkAsFake}
                className="flex-1 min-w-[140px] px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                <XCircle className="w-4 h-4" />
                Mark as Fake
              </button>
              <button
                onClick={handleRequestMoreInfo}
                className="flex-1 min-w-[140px] px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                <HelpCircle className="w-4 h-4" />
                Request More Info
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <button
            onClick={onClose}
            className={`w-full md:w-auto px-6 py-2.5 rounded-lg font-semibold transition ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function for status colors
const getStatusColor = (status) => {
  const colors = {
    pending: "bg-amber-100 text-amber-700 border border-amber-300",
    verified: "bg-blue-100 text-blue-700 border border-blue-300",
    assigned: "bg-indigo-100 text-indigo-700 border border-indigo-300",
    in_progress: "bg-violet-100 text-violet-700 border border-violet-300",
    completed: "bg-emerald-100 text-emerald-700 border border-emerald-300",
    rejected: "bg-red-100 text-red-700 border border-red-300",
    user_approval_pending: "bg-orange-100 text-orange-700 border border-orange-300",
    approved_by_user: "bg-teal-100 text-teal-700 border border-teal-300",
    rejected_by_user: "bg-rose-100 text-rose-700 border border-rose-300",
  };
  return colors[status] || "bg-slate-100 text-slate-700 border border-slate-300";
};

const getStatusIcon = (status) => {
  const icons = {
    pending: <Clock2 className="w-4 h-4" />,
    verified: <Search className="w-4 h-4" />,
    assigned: <MapPin className="w-4 h-4" />,
    in_progress: <Wrench className="w-4 h-4" />,
    completed: <CheckCircle2 className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />,
    user_approval_pending: <HelpCircle className="w-4 h-4" />,
    approved_by_user: <ThumbsUp className="w-4 h-4" />,
    rejected_by_user: <ThumbsDown className="w-4 h-4" />,
  };
  return icons[status] || <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />;
};

// Icon Components
const FileTextIcon = ({ className }) => <FileText className={className} />;
const MapPinIcon = ({ className }) => <MapPin className={className} />;
const BuildingIcon = ({ className }) => <Building2 className={className} />;
const CalendarIcon = ({ className }) => <Calendar className={className} />;
const ImageIcon = ({ className }) => <Image className={className} />;
const CommentsIcon = ({ className }) => <MessageCircle className={className} />;
const AlertIcon = ({ className }) => <AlertTriangle className={className} />;

export default ComplaintDetail;
