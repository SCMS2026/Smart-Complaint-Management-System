import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from "../services/department";
import { fetchUsers, createUser, setUserRole } from "../services/auth";
import { fetchComplaints } from "../services/complaints";
import { fetchWorkerTasks } from "../services/workerTask";

const SuperAdminDashboard = () => {
  const nav = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [workerTasks, setWorkerTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({ name: "", email: "", password: "", role: "", department_id: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "super_admin") {
      nav("/");
      return;
    }

    loadDepartments();
    loadUsers();
    loadComplaints();
    loadWorkerTasks();
  }, [nav]);

  const loadComplaints = async () => {
    const res = await fetchComplaints();
    if (res.success) {
      setComplaints(res.complaints || []);
    } else {
      setError(res.message);
    }
  };

  const loadWorkerTasks = async () => {
    const res = await fetchWorkerTasks();
    if (res.success) {
      setWorkerTasks(res.workerTasks || []);
    }
  };

  const loadDepartments = async () => {
    setLoading(true);
    const res = await fetchDepartments();
    if (res.success) {
      setDepartments(res.departments);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    const res = await fetchUsers();
    if (res.success) {
      setUsers(res.users);
    } else {
      setError(res.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createDepartment(formData);
    if (res.success) {
      setDepartments([...departments, res.department]);
      setShowCreateForm(false);
      setFormData({ name: "", description: "" });
    } else {
      setError(res.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await updateDepartment(editingDepartment._id, formData);
    if (res.success) {
      setDepartments(departments.map(d => d._id === editingDepartment._id ? res.department : d));
      setEditingDepartment(null);
      setFormData({ name: "", description: "" });
    } else {
      setError(res.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (userFormData.role === 'department_admin' && !userFormData.department_id) {
      setError("Department is required for department admin");
      return;
    }
    const res = await createUser(userFormData);
    if (res.success) {
      setUsers([...users, res.user]);
      setShowUserForm(false);
      setUserFormData({ name: "", email: "", password: "", role: "", department_id: "" });
    } else {
      setError(res.message);
    }
  };

  const handleUserUpdate = async (userId, role, department_id) => {
    const res = await setUserRole(userId, role, department_id);
    if (res.success) {
      setUsers(users.map(u => u._id === userId ? res.user : u));
    } else {
      setError(res.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      const res = await deleteDepartment(id);
      if (res.success) {
        setDepartments(departments.filter(d => d._id !== id));
      } else {
        setError(res.message);
      }
    }
  };

  const startEdit = (dept) => {
    setEditingDepartment(dept);
    setFormData({ name: dept.name, description: dept.description || "" });
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Departments</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Department
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept._id} className="border-t">
                  <td className="px-4 py-2">{dept.name}</td>
                  <td className="px-4 py-2">{dept.description}</td>
                  <td className="px-4 py-2">{new Date(dept.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => startEdit(dept)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User Management</h2>
          <button
            onClick={() => setShowUserForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Department</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-t">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleUserUpdate(user._id, e.target.value, user.department && typeof user.department === 'object' ? user.department._id : user.department || "")}
                      className="border rounded px-2 py-1"
                    >
                      <option value="user">User</option>
                      <option value="department_admin">Department Admin</option>
                      <option value="worker">Worker</option>
                      <option value="contractor">Contractor</option>
                      <option value="analyzer">Analyzer</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={user.department && typeof user.department === 'object' ? user.department._id : user.department || ""}
                      onChange={(e) => {
                        if (user.role === 'department_admin' && e.target.value === "") {
                          setError("Department admin must have a department assigned");
                          return;
                        }
                        handleUserUpdate(user._id, user.role, e.target.value);
                      }}
                      className="border rounded px-2 py-1"
                    >
                      <option value="">None</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    {/* Add delete if needed */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Create User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="department_admin">Department Admin</option>
                  <option value="worker">Worker</option>
                  <option value="contractor">Contractor</option>
                  <option value="analyzer">Analyzer</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  value={userFormData.department_id}
                  onChange={(e) => setUserFormData({...userFormData, department_id: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false);
                    setUserFormData({ name: "", email: "", password: "", role: "", department_id: "" });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(showCreateForm || editingDepartment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              {editingDepartment ? "Edit Department" : "Create Department"}
            </h3>
            <form onSubmit={editingDepartment ? handleUpdate : handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingDepartment(null);
                    setFormData({ name: "", description: "" });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingDepartment ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaints & Worker Tasks Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">All Complaints & Assigned Workers</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Complaint ID</th>
                <th className="px-4 py-2 text-left">Issue</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Department</th>
                <th className="px-4 py-2 text-left">Assigned Worker</th>
                <th className="px-4 py-2 text-left">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-2 text-center text-gray-500">No complaints found</td>
                </tr>
              ) : (
                complaints.map(complaint => {
                  const assignedTask = workerTasks.find(t => t.complaint_id === complaint._id);
                  const workerName = assignedTask?.worker_id?.name || assignedTask?.worker?.name || "Not assigned";
                  
                  return (
                    <tr key={complaint._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{complaint._id?.slice(-6) || "-"}</td>
                      <td className="px-4 py-2">{complaint.issue || "-"}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          complaint.status === 'verified' ? 'bg-blue-100 text-blue-700' :
                          complaint.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                          complaint.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {complaint.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-2">{complaint.department_id?.name || "-"}</td>
                      <td className="px-4 py-2">{workerName}</td>
                      <td className="px-4 py-2 text-sm">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;