import React,{ useEffect, useState } from "react";
import { fetchComplaints } from "../services/complaints";

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const local = localStorage.getItem("user");
    if (local) {
      try {
        const u = JSON.parse(local);
        setUserRole(u.role);
      } catch {}
    }

    const load = async () => {
      const res = await fetchComplaints();
      if (res.success) {
        setComplaints(res.complaints || []);
      } else {
        setError(res.message || "Could not load complaints");
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div>Loading complaints...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {userRole === 'user' ? 'My Complaints' : 'All Complaints'}
      </h1>
      {complaints.length === 0 ? (
        <p>No complaints found.</p>
      ) : (
        <ul className="space-y-3">
          {complaints.map((c) => (
            <li key={c._id} className="border p-3 rounded">
              <p><strong>Description:</strong> {c.description}</p>
              <p><strong>Status:</strong> {c.status}</p>
              <p><strong>User:</strong> {c.userId?.name || "—"}</p>
              <p><strong>Asset:</strong> {c.assetId?.name || "—"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllComplaints;
