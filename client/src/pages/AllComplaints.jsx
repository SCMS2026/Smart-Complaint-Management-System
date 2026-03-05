import React,{ useEffect, useState } from "react";
import { fetchComplaints, createComplaintRequest } from "../services/complaints";
import { createPermissionRequest } from "../services/permissions";
import { fetchAssets } from "../services/assets";

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const [assets, setAssets] = useState([]);

  // form states
  const [complaintData, setComplaintData] = useState({ assetId: "", description: "", issue: "", location: "", image: null });
  const [permData, setPermData] = useState({ assetId: "", reason: "" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

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

    const loadAssets = async () => {
      const res = await fetchAssets();
      if (res.success) setAssets(res.assets || []);
    };

    load();
    loadAssets();

    // attempt to get current position for location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = `${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`;
          setComplaintData(prev => ({ ...prev, location: loc }));
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if ((assets.length > 0 && !complaintData.assetId) || !complaintData.description || !complaintData.issue || !complaintData.location) {
      setFormError("Please fill out all fields.");
      return;
    }
    // include userId from storage
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const payload = { ...complaintData, userId: user?.id };
    const res = await createComplaintRequest(payload);
    if (res.success) {
      setFormSuccess("Complaint submitted successfully.");
      setComplaintData({ assetId: "", description: "", issue: "", location: "", image: null });
      // reload complaints
      const updated = await fetchComplaints();
      if (updated.success) setComplaints(updated.complaints || []);
    } else {
      setFormError(res.message || "Error submitting complaint");
    }
  };

  const handlePermissionSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if ((assets.length > 0 && !permData.assetId) || !permData.reason) {
      setFormError("Please fill out all fields.");
      return;
    }
    const res = await createPermissionRequest(permData);
    if (res.success) {
      setFormSuccess("Permission request sent.");
      setPermData({ assetId: "", reason: "" });
    } else {
      setFormError(res.message || "Error sending request");
    }
  };

  if (loading) return <div>Loading complaints...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {userRole === 'user' ? 'My Complaints' : 'All Complaints'}
      </h1>

      {/* action form */}
      {userRole === 'user' && (
        <form onSubmit={handleComplaintSubmit} className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Create Complaint</h2>
          {formError && <p className="text-red-600 mb-2">{formError}</p>}
          {formSuccess && <p className="text-green-600 mb-2">{formSuccess}</p>}
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Your name"
              value={currentUser?.name || ""}
              disabled
              className="border px-2 py-1 rounded bg-gray-100"
            />
            {assets.length > 0 ? (
              <select
                value={complaintData.assetId}
                onChange={e => setComplaintData({...complaintData, assetId: e.target.value})}
                className="border px-2 py-1 rounded"
              >
                <option value="">Select asset</option>
                {assets.map(a => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Asset ID (optional)"
                value={complaintData.assetId}
                onChange={e => setComplaintData({...complaintData, assetId: e.target.value})}
                className="border px-2 py-1 rounded"
              />
            )}
            <input
              type="text"
              placeholder="Issue (e.g. Street Light Broken)"
              value={complaintData.issue}
              onChange={e => setComplaintData({...complaintData, issue: e.target.value})}
              className="border px-2 py-1 rounded"
            />
            <input
              type="text"
              placeholder="Location"
              value={complaintData.location}
              onChange={e => setComplaintData({...complaintData, location: e.target.value})}
              className="border px-2 py-1 rounded"
            />
            <textarea
              placeholder="Description"
              value={complaintData.description}
              onChange={e => setComplaintData({...complaintData, description: e.target.value})}
              className="border px-2 py-1 rounded"
            />
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setComplaintData(prev => ({ ...prev, image: reader.result }));
                  reader.readAsDataURL(file);
                }
              }}
            />
            {complaintData.image && (
              <img src={complaintData.image} alt="preview" className="mt-2 w-32 h-32 object-cover rounded" />
            )}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Submit
            </button>
          </div>
        </form>
      )}

      {userRole === 'contractor' && (
        <form onSubmit={handlePermissionSubmit} className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Request Permission</h2>
          {formError && <p className="text-red-600 mb-2">{formError}</p>}
          {formSuccess && <p className="text-green-600 mb-2">{formSuccess}</p>}
          <div className="flex flex-col gap-2">
            {assets.length > 0 ? (
              <select
                value={permData.assetId}
                onChange={e => setPermData({...permData, assetId: e.target.value})}
                className="border px-2 py-1 rounded"
              >
                <option value="">Select asset</option>
                {assets.map(a => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Asset ID"
                value={permData.assetId}
                onChange={e => setPermData({...permData, assetId: e.target.value})}
                className="border px-2 py-1 rounded"
              />
            )}
            <textarea
              placeholder="Reason for permission"
              value={permData.reason}
              onChange={e => setPermData({...permData, reason: e.target.value})}
              className="border px-2 py-1 rounded"
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              Request
            </button>
          </div>
        </form>
      )}

      {complaints.length === 0 ? (
        <p className="text-gray-600">No complaints found.</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white shadow rounded-lg flex flex-col md:flex-row overflow-hidden">
              {c.image && (
                <img src={c.image} alt="complaint" className="w-full md:w-32 object-cover" />
              )}
              <div className="p-4 flex-1">
                <h3 className="font-bold text-lg text-gray-800">{c.issue || "Issue"}</h3>
                <p className="text-sm text-gray-600">{c.location}</p>
                <p className="mt-2 text-gray-700">{c.description}</p>
                <p className="mt-2"><span className="font-semibold">Status:</span> <span className="capitalize">{c.status}</span></p>
                <p><span className="font-semibold">User:</span> {c.userId?.name || "—"}</p>
                <p><span className="font-semibold">Asset:</span> {c.assetId?.name || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllComplaints;
