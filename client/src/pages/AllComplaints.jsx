import React, { useEffect, useState } from "react";
import {
  fetchComplaints,
  createComplaintRequest,
} from "../services/complaints";
import { createPermissionRequest } from "../services/permissions";
import { fetchAssets } from "../services/assets";

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [assets, setAssets] = useState([]);

  const [complaintData, setComplaintData] = useState({
    assetId: "",
    category: "",
    issue: "",
    address: "",
    city: "",
    District: "",
    Taluka: "",
    village: "",
    pincode: "",
    description: "",
    image: null,
  });

  const [permData, setPermData] = useState({ assetId: "", reason: "" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    const local = localStorage.getItem("user");

    if (local) {
      try {
        const u = JSON.parse(local);
        setUserRole(u.role);
      } catch {
        setUserRole(null);
      }
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
  }, []);

  const selectedAsset = assets.find((a) => a._id === complaintData.assetId);

  const renderCategoryOptions = () => {
    if (!selectedAsset || !selectedAsset.category) return null;

    let categoriesArray = Array.isArray(selectedAsset.category)
      ? selectedAsset.category
      : selectedAsset.category.split(/,|(?=[A-Z])/);

    return categoriesArray.map((cat, index) => (
      <option key={index} value={cat.trim()}>
        {cat.trim()}
      </option>
    ));
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();

    setFormError("");
    setFormSuccess("");

    if (
      (assets.length > 0 && !complaintData.assetId) ||
      !complaintData.issue ||
      !complaintData.description ||
      !complaintData.address ||
      !complaintData.city ||
      !complaintData.District ||
      !complaintData.Taluka ||
      !complaintData.village ||
      !complaintData.pincode
    ) {
      setFormError("Please fill out all fields.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "null");

    const payload = {
      ...complaintData,
      userId: user?.id,
    };

    const res = await createComplaintRequest(payload);

    if (res.success) {
      setFormSuccess("Complaint submitted successfully.");

      setComplaintData({
        assetId: "",
        category: "",
        issue: "",
        address: "",
        city: "",
        District: "",
        Taluka: "",
        village: "",
        pincode: "",
        description: "",
        image: null,
      });

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
        {userRole === "user" ? "My Complaints" : "All Complaints"}
      </h1>

      {userRole === "user" && (
        <form
          onSubmit={handleComplaintSubmit}
          className="mb-6 p-4 bg-white rounded shadow"
        >
          <h2 className="text-lg font-semibold mb-2">Create Complaint</h2>

          {formError && <p className="text-red-600 mb-2">{formError}</p>}
          {formSuccess && <p className="text-green-600 mb-2">{formSuccess}</p>}

          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={currentUser?.name || ""}
              disabled
              className="border px-2 py-1 rounded bg-gray-100"
            />

            <select
              value={complaintData.assetId}
              onChange={(e) =>
                setComplaintData({
                  ...complaintData,
                  assetId: e.target.value,
                  category: "",
                })
              }
              className="border px-2 py-1 rounded"
            >
              <option value="">Select Department</option>
              {assets.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>

            <select
              value={complaintData.category}
              onChange={(e) =>
                setComplaintData({
                  ...complaintData,
                  category: e.target.value,
                })
              }
              className="border px-2 py-1 rounded"
              disabled={!complaintData.assetId}
            >
              <option value="">Select Category</option>
              {renderCategoryOptions()}
            </select>

            <input
              type="text"
              placeholder="Issue"
              value={complaintData.issue}
              onChange={(e) =>
                setComplaintData({
                  ...complaintData,
                  issue: e.target.value,
                })
              }
              className="border px-2 py-1 rounded"
            />

            <input
              type="text"
              placeholder="Address"
              value={complaintData.address}
              onChange={(e) =>
                setComplaintData({
                  ...complaintData,
                  address: e.target.value,
                })
              }
              className="border px-2 py-1 rounded"
            />

            <input
              type="text"
              placeholder="City"
              value={complaintData.city}
              onChange={(e) =>
                setComplaintData({
                  ...complaintData,
                  city: e.target.value,
                })
              }
              className="border px-2 py-1 rounded"
            />

            <input
              type="text"
              placeholder="District"
              value={complaintData.District}
              onChange={(e) =>
                setComplaintData({
                  ...complaintData,
                  District: e.target.value,
                })
              }
              className="border px-2 py-1 rounded"
            />

            <input
              type="text"
              placeholder="Taluka"
              value={complaintData.Taluka}
              onChange={(e) =>
                setComplaintData({
                  ...complaintData,
                  Taluka: e.target.value,
                })
              }
              className="border px-2 py-1 rounded"
            />

            <input
              type="text"
              placeholder="Village"
              value={complaintData.village}
              onChange={(e) =>
                setComplaintData({
                  ...complaintData,
                  village: e.target.value,
                })
              }
              className="border px-2 py-1 rounded"
            />

            <input
              type="text"
              placeholder="Pincode"
              value={complaintData.pincode}
              onChange={(e) =>
                setComplaintData({
                  ...complaintData,
                  pincode: e.target.value,
                })
              }
              className="border px-2 py-1 rounded"
            />

            <textarea
              placeholder="Description"
              value={complaintData.description}
              onChange={(e) =>
                setComplaintData({
                  ...complaintData,
                  description: e.target.value,
                })
              }
              className="border px-2 py-1 rounded"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();

                reader.onload = () =>
                  setComplaintData((prev) => ({
                    ...prev,
                    image: reader.result,
                  }));

                reader.readAsDataURL(file);
              }}
            />

            {complaintData.image && (
              <img
                src={complaintData.image}
                alt="preview"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Submit Complaint
            </button>
          </div>
        </form>
      )}

      {complaints.length === 0 ? (
        <p className="text-gray-600">No complaints found.</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white shadow rounded-lg p-4">
              <h3 className="font-bold text-lg">{c.issue}</h3>
              <p>{c.description}</p>
              <p className="text-sm text-gray-500">
                {c.city} - {c.village}
              </p>
              <p className="mt-1">
                Status: <span className="capitalize">{c.status}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllComplaints;