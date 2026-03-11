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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen min-w-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        My Complaints
      </h1>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl  shadow-lg mb-10 max-w-screen"
      >
        <h2 className="text-xl font-semibold mb-4">
          Create Complaint
        </h2>

        {formError && (
          <p className="bg-red-100 text-red-600 p-2 rounded mb-3">
            {formError}
          </p>
        )}

        {formSuccess && (
          <p className="bg-green-100 text-green-600 p-2 rounded mb-3">
            {formSuccess}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            type="text"
            value={currentUser?.name || ""}
            disabled
            className="border p-2 rounded bg-gray-100"
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
            className="border p-2 rounded"
          >
            <option value="">Select Department</option>

            {assets.map((asset) => (
              <option key={asset._id} value={asset._id}>
                {asset.issue}
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
            placeholder="Location"
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
            className="border p-2 rounded md:col-span-2"
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
              className="w-32 rounded shadow"
            />
          )}
        </div>

        <button
          type="submit"
          className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Submit Complaint
        </button>
      </form>

      {/* COMPLAINT LIST */}

      {complaints.length === 0 ? (
        <p className="text-gray-500">No complaints found</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white  rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
            >
              {c.image && (
                <img
                  src={c.image}
                  alt=""
                  className="h-80 w-full object-cover"
                />
              )}

              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800">
                  {c.issue}
                </h3>

                <p className="text-gray-600 text-sm mt-1">
                  {c.description}
                </p>

                <p className="text-gray-500 text-sm mt-2">
                  {c.city} - {c.village}
                </p>

                <span className="inline-block mt-3 px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllComplaints;