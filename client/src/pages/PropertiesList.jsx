import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAssets } from "../services/assets";
import { createPermissionRequest } from "../services/permissions";

const PROPERTY_TYPES = [
  { value: 'street_light', label: 'Street Light', icon: '💡', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'bench', label: 'Bench', icon: '🪑', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'park', label: 'Park', icon: '🌳', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'road', label: 'Road', icon: '🛣️', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  { value: 'drain', label: 'Drain', icon: '🌊', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'water_line', label: 'Water Line', icon: '🚰', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'sewer_line', label: 'Sewer Line', icon: '🔧', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'public_building', label: 'Public Building', icon: '🏛️', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'playground', label: 'Playground', icon: '🎮', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { value: 'garden', label: 'Garden', icon: '🌺', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'signboard', label: 'Signboard', icon: '🪧', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'other', label: 'Other', icon: '📦', color: 'bg-slate-50 text-slate-700 border-slate-200' }
];

const STATUS_COLORS = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-gray-50 text-gray-600',
  under_maintenance: 'bg-amber-50 text-amber-700',
  damaged: 'bg-red-50 text-red-700',
  retired: 'bg-slate-50 text-slate-600'
};

const PropertyCard = ({ property, onRequestPermission }) => {
  const typeInfo = PROPERTY_TYPES.find(t => t.value === property.type) || PROPERTY_TYPES[PROPERTY_TYPES.length - 1];
  const statusColor = STATUS_COLORS[property.status] || 'bg-gray-50 text-gray-600';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition">
      {/* Property Image */}
      <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative">
        {property.image ? (
          <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-5xl opacity-40">{typeInfo.icon}</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-2">{property.name}</h3>
        </div>
        
        <p className="text-sm text-slate-500 mb-3">
          <span className="font-medium">Code:</span> {property.assetCode}
        </p>

        <div className="space-y-2 text-sm text-slate-600 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-slate-400">📍</span>
            <span>{property.location?.address || 'No address'}, {property.location?.area}, {property.location?.city}</span>
          </div>
          {property.department_id && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">🏢</span>
              <span>{property.department_id.name || property.department_id}</span>
            </div>
          )}
          {property.description && (
            <p className="text-slate-500 mt-2 line-clamp-2">{property.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
            {property.status.replace('_', ' ')}
          </span>
          <button
            onClick={() => onRequestPermission(property)}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition"
          >
            Request Permission
          </button>
        </div>
      </div>
    </div>
  );
};

const PropertiesList = () => {
  const nav = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [filters, setFilters] = useState({
    type: '',
    city: '',
    area: '',
    status: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [permissionForm, setPermissionForm] = useState({
    workType: 'repair',
    reason: '',
    proposedStartDate: '',
    proposedEndDate: '',
    priority: 'medium',
    estimatedCost: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "contractor") {
      nav("/login");
      return;
    }
    loadProperties();
  }, [nav, filters]);

  const loadProperties = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAssets(filters);
      if (res.success) {
        setProperties(res.assets || []);
      } else {
        setError(res.message || "Failed to load properties");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const openRequestModal = (property) => {
    setSelectedProperty(property);
    // Set default dates (start tomorrow, end in 7 days)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    setPermissionForm({
      workType: 'repair',
      reason: '',
      proposedStartDate: tomorrow.toISOString().split('T')[0],
      proposedEndDate: endDate.toISOString().split('T')[0],
      priority: 'medium',
      estimatedCost: ''
    });
    setShowModal(true);
  };

  const handleSubmitPermission = async (e) => {
    e.preventDefault();
    if (!permissionForm.reason || !permissionForm.proposedStartDate || !permissionForm.proposedEndDate) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createPermissionRequest({
        assetId: selectedProperty._id,
        workType: permissionForm.workType,
        reason: permissionForm.reason,
        proposedStartDate: new Date(permissionForm.proposedStartDate),
        proposedEndDate: new Date(permissionForm.proposedEndDate),
        priority: permissionForm.priority,
        estimatedCost: permissionForm.estimatedCost ? Number(permissionForm.estimatedCost) : null
      });

      if (res.success) {
        alert("Permission request submitted successfully!");
        setShowModal(false);
        setSelectedProperty(null);
      } else {
        alert(res.message || "Failed to submit request");
      }
    } catch (err) {
      alert(err.message || "Error submitting request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading properties…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Public Properties</h1>
          <p className="text-slate-600 mt-2">Browse public properties and request permission to work on them</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by name, code, address..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Filter by city"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Area</label>
                <input
                  type="text"
                  value={filters.area}
                  onChange={(e) => handleFilterChange('area', e.target.value)}
                  placeholder="Filter by area"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFilters({ type: '', city: '', area: '', status: '', search: '' })}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Properties Count */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">{properties.length}</span> properties
          </p>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
            <p className="text-5xl mb-4">🏢</p>
            <p className="text-slate-400 text-lg">No properties found</p>
            <p className="text-slate-400 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard 
                key={property._id} 
                property={property} 
                onRequestPermission={openRequestModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Permission Request Modal */}
      {showModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Request Permission</h2>
              <p className="text-slate-600 mt-1">
                Requesting permission for: <span className="font-semibold">{selectedProperty.name}</span>
                <span className="text-sm text-slate-500 ml-2">({selectedProperty.assetCode})</span>
              </p>
            </div>

            <form onSubmit={handleSubmitPermission} className="p-6 space-y-5">
              {/* Work Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Work Type *</label>
                <select
                  value={permissionForm.workType}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, workType: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                >
                  <option value="repair">Repair</option>
                  <option value="installation">Installation</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inspection">Inspection</option>
                  <option value="upgrade">Upgrade</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reason / Description *</label>
                <textarea
                  value={permissionForm.reason}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={4}
                  placeholder="Describe what work needs to be done and why..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Proposed Start Date *</label>
                  <input
                    type="date"
                    value={permissionForm.proposedStartDate}
                    onChange={(e) => setPermissionForm(prev => ({ ...prev, proposedStartDate: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Proposed End Date *</label>
                  <input
                    type="date"
                    value={permissionForm.proposedEndDate}
                    onChange={(e) => setPermissionForm(prev => ({ ...prev, proposedEndDate: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              {/* Priority & Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    value={permissionForm.priority}
                    onChange={(e) => setPermissionForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={permissionForm.estimatedCost}
                    onChange={(e) => setPermissionForm(prev => ({ ...prev, estimatedCost: e.target.value }))}
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-5 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesList;