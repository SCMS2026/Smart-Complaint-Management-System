import React, { useEffect, useState } from "react";
import {
  fetchComplaints,
  createComplaintRequest,
} from "../services/complaints";
import { fetchAssets } from "../services/assets";

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [assets, setAssets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [complaintData, setComplaintData] = useState({
    assetId: "",
    category: "",
    issue: "",
    location: "",
    city: "",
    District: "",
    Taluka: "",
    village: "",
    pincode: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    loadComplaints();
    loadAssets();
  }, []);

  const loadComplaints = async () => {
    const res = await fetchComplaints();

    if (res.success) {
      setComplaints(res.complaints || []);
    } else {
      setError(res.message);
    }

    setLoading(false);
  };

  const loadAssets = async () => {
    const res = await fetchAssets();

    if (res.success) {
      setAssets(res.assets || []);
    }
  };

  const selectedAsset = assets.find((a) => a._id === complaintData.assetId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");
    setFormSuccess("");

    if (
      !complaintData.assetId ||
      !complaintData.category ||
      !complaintData.description ||
      !complaintData.location
    ) {
      setFormError("Please fill all required fields");
      return;
    }
    const payload = {
      ...complaintData,
      issue: selectedAsset?.issue || "",
    };

    const res = await createComplaintRequest(payload);

    if (res.success) {
      setFormSuccess("Complaint submitted successfully");

      setComplaintData({
        assetId: "",
        category: "",
        issue: "",
        location: "",
        city: "",
        District: "",
        Taluka: "",
        village: "",
        pincode: "",
        description: "",
        image: null,
      });

      loadComplaints();
    } else {
      setFormError(res.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Complaints</h1>

      {/* Complaint Form */}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow p-4 rounded mb-6"
      >
        <h2 className="text-lg font-semibold mb-3">Create Complaint</h2>

        {formError && <p className="text-red-600">{formError}</p>}

        {formSuccess && <p className="text-green-600">{formSuccess}</p>}

        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={currentUser?.name || ""}
            disabled
            className="border p-2 rounded bg-gray-100"
          />

          {/* Department */}

          <select
            value={complaintData.assetId}
            onChange={(e) =>
              setComplaintData({
                ...complaintData,
                assetId: e.target.value,
                category: "",
              })
            }
            className="border p-2 rounded"
          >
            <option value="">Select Department</option>

            {assets.map((asset) => (
              <option key={asset._id} value={asset._id}>
                {asset.issue}
              </option>
            ))}
          </select>

          {/* Category */}

          <select
            value={complaintData.category}
            onChange={(e) =>
              setComplaintData({
                ...complaintData,
                category: e.target.value,
              })
            }
            className="border p-2 rounded"
          >
            <option value="">Select Category</option>

            {selectedAsset?.category?.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="location"
            value={complaintData.location}
            onChange={(e) =>
              setComplaintData({
                ...complaintData,
                location: e.target.value,
              })
            }
            className="border p-2 rounded"
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
            className="border p-2 rounded"
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
            className="border p-2 rounded"
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
            className="border p-2 rounded"
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
            className="border p-2 rounded"
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
            className="border p-2 rounded"
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
            className="border p-2 rounded"
          />

          {/* Image Upload */}

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
              className="w-32 mt-2 rounded"
            />
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded mt-2"
          >
            Submit Complaint
          </button>
        </div>
      </form>

      {/* Complaints List */}

      {complaints.length === 0 ? (
        <p>No complaints found</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white shadow p-4 rounded">
              <h3 className="font-bold">{c.issue}</h3>

              <p>{c.description}</p>

              <p className="text-sm text-gray-500">
                {c.city} - {c.village}
              </p>

              <p className="text-sm mt-1">Status: {c.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllComplaints;
