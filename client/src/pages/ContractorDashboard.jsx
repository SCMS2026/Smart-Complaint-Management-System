import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWorkerTasks, updateWorkerTaskStatus } from "../services/workerTask";
import { updateComplaintStatusRequest } from "../services/complaints";

const ContractorDashboard = () => {
  const nav = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    setLoading(true);
    setError("");
    const res = await fetchWorkerTasks();
    if (res.success) {
      setTasks(res.workerTasks || []);
    } else {
      setError(res.message || "Failed to load tasks");
    }
    setLoading(false);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || (user.role !== "contractor" && user.role !== "worker")) {
      nav("/");
      return;
    }
    loadTasks();
  }, [nav]);

  const updateTask = async (task, newStatus) => {
    try {
      const taskRes = await updateWorkerTaskStatus(task._id, { status: newStatus });
      if (!taskRes.success) {
        setError(taskRes.message || "Unable to update task");
        return;
      }

      if (newStatus === "completed") {
        // set complaint to waiting_user for final approval
        await updateComplaintStatusRequest(task.complaint_id._id, "waiting_user");
      } else if (newStatus === "started") {
        await updateComplaintStatusRequest(task.complaint_id._id, "in_progress");
      }

      loadTasks();
    } catch (err) {
      setError(err.message || "Operation failed");
    }
  };

  return (
    <div className="min-h-screen pt-20 p-6">
      <h1 className="text-3xl font-bold mb-4">Contractor Dashboard</h1>

      {loading && <div>Loading tasks...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {!loading && tasks.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">No assigned tasks yet.</div>
      )}

      <div className="grid gap-4">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="font-semibold text-lg">{task.complaint_id?.issue || "Complaint"}</h2>
                <p className="text-sm text-gray-600">Complaint ID: {task.complaint_id?._id?.slice(-6)}</p>
                <p className="text-sm text-gray-600">Location: {task.complaint_id?.location || "N/A"}</p>
              </div>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">{task.status}</span>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => updateTask(task, "started")}
                className="py-2 px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                disabled={task.status !== "assigned"}
              >
                Start Work
              </button>
              <button
                onClick={() => updateTask(task, "completed")}
                className="py-2 px-3 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={task.status !== "started"}
              >
                Mark Complete
              </button>
              <button
                onClick={() => updateTask(task, "assigned")}
                className="py-2 px-3 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                disabled={task.status === "assigned"}
              >
                Reset to Assigned
              </button>
            </div>

            {task.before_photo && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Before photo:</p>
                <img src={task.before_photo} alt="before" className="w-full max-h-48 object-cover rounded-lg" />
              </div>
            )}

            {task.after_photo && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">After photo:</p>
                <img src={task.after_photo} alt="after" className="w-full max-h-48 object-cover rounded-lg" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractorDashboard;
