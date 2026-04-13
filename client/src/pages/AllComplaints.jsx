import { useEffect, useState } from "react";
import { fetchComplaints, createComplaintRequest } from "../services/complaints";
import { fetchAssets } from "../services/assets";

const AllComplaints = () => {
  const [assets, setAssets] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    assetId: "",
    category: "",
    location: "",
    city: "",
    District: "",
    Taluka: "",
    village: "",
    pincode: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const assetsRes = await fetchAssets();
    const complaintsRes = await fetchComplaints();

    console.log("🔥 ASSETS:", assetsRes.assets);

    if (assetsRes.success) setAssets(assetsRes.assets || []);
    if (complaintsRes.success) setComplaints(complaintsRes.complaints || []);

    setLoading(false);
  };

  // ✅ FIX: id match safe
  const selectedAsset = assets.find(
    (a) => String(a._id) === String(form.assetId)
  );

  console.log("👉 Selected:", selectedAsset);

  // ✅ FIX: category safe
  const categories =
    selectedAsset?.category && selectedAsset.category.length > 0
      ? selectedAsset.category
      : [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      issue: selectedAsset?.issue, // department
      category: form.category,     // issue
    };

    console.log("🚀 PAYLOAD:", payload);

    const res = await createComplaintRequest(payload);

    if (res.success) {
      alert("Complaint Submitted");

      setForm({
        assetId: "",
        category: "",
        location: "",
        city: "",
        District: "",
        Taluka: "",
        village: "",
        pincode: "",
        description: "",
      });

      loadData();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">

      <h2 className="text-2xl mb-4">Create Complaint</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

        {/* Department */}
        <select
          value={form.assetId}
          onChange={(e) =>
            setForm({ ...form, assetId: e.target.value, category: "" })
          }
          className="border p-2"
        >
          <option value="">Select Department</option>
          {assets.map((a) => (
            <option key={a._id} value={a._id}>
              {a.issue}
            </option>
          ))}
        </select>

        {/* Issues */}
        <select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
          className="border p-2"
        >
          <option value="">Select Issue</option>

          {categories.length > 0 ? (
            categories.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))
          ) : (
            <option disabled>No issues available</option>
          )}
        </select>

        <input placeholder="Location" className="border p-2"
          value={form.location}
          onChange={(e)=>setForm({...form, location:e.target.value})}
        />

        <input placeholder="City" className="border p-2"
          value={form.city}
          onChange={(e)=>setForm({...form, city:e.target.value})}
        />

        <input placeholder="District" className="border p-2"
          value={form.District}
          onChange={(e)=>setForm({...form, District:e.target.value})}
        />

        <input placeholder="Taluka" className="border p-2"
          value={form.Taluka}
          onChange={(e)=>setForm({...form, Taluka:e.target.value})}
        />

        <input placeholder="Village" className="border p-2"
          value={form.village}
          onChange={(e)=>setForm({...form, village:e.target.value})}
        />

        <input placeholder="Pincode" className="border p-2"
          value={form.pincode}
          onChange={(e)=>setForm({...form, pincode:e.target.value})}
        />

        <textarea placeholder="Description" className="border p-2 col-span-2"
          value={form.description}
          onChange={(e)=>setForm({...form, description:e.target.value})}
        />

        <button className="bg-blue-600 text-white p-2 col-span-2">
          Submit
        </button>
      </form>

      {/* LIST */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {complaints.map((c) => (
          <div key={c._id} className="p-4 border">
            <h3>{c.category}</h3>
            <p>{c.issue}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllComplaints;