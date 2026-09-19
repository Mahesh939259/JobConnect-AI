import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle, Ban, Users } from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (role !== 'All') params.append('role', role);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleToggleSuspend = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/suspend`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isSuspended: res.data.isSuspended } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          User Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review accounts, assign roles, and moderate user access
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search by name or email..."
            className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
          />
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
        >
          <option value="All">All Roles</option>
          <option value="student">Students</option>
          <option value="recruiter">Recruiters</option>
          <option value="admin">Admins</option>
        </select>

        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
        >
          Filter
        </button>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Joined</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize font-semibold text-slate-700">{u.role}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.location || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isSuspended
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleSuspend(u._id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            u.isSuspended
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {u.isSuspended ? 'Activate' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
