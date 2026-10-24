import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import {
  FiUsers,
  FiSettings,
  FiInbox,
  FiShield,
  FiTrash2,
  FiCheck,
  FiPlus
} from 'react-icons/fi';

const TABS = [
  { id: 'overview', label: 'Overview', icon: FiShield },
  { id: 'users', label: 'Users', icon: FiUsers },
  { id: 'inbox', label: 'Inbox', icon: FiInbox },
  { id: 'config', label: 'Predefined Data', icon: FiSettings },
  { id: 'admins', label: 'Admin Users', icon: FiShield }
];

const AdminPanel = () => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [config, setConfig] = useState({ colors: [], tags: [], seasons: [], occasions: [], categories: {} });
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '' });
  const [configEdit, setConfigEdit] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTabData();
  }, [tab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (tab === 'overview') {
        const res = await axios.get('/api/admin/stats');
        setStats(res.data);
      } else if (tab === 'users') {
        const res = await axios.get('/api/admin/users');
        setUsers(res.data);
      } else if (tab === 'inbox') {
        const res = await axios.get('/api/admin/comments');
        setComments(res.data);
      } else if (tab === 'config') {
        const res = await axios.get('/api/admin/config');
        setConfig(res.data);
        setConfigEdit(JSON.stringify(res.data, null, 2));
      } else if (tab === 'admins') {
        const res = await axios.get('/api/admin/admin-users');
        setAdmins(res.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`/api/admin/users/${id}`);
    loadTabData();
  };

  const promoteUser = async (id) => {
    await axios.post(`/api/admin/users/${id}/promote`);
    alert('User promoted to admin');
    loadTabData();
  };

  const markRead = async (id) => {
    await axios.put(`/api/admin/comments/${id}/read`);
    loadTabData();
  };

  const deleteComment = async (id) => {
    await axios.delete(`/api/admin/comments/${id}`);
    loadTabData();
  };

  const saveConfig = async () => {
    try {
      const parsed = JSON.parse(configEdit);
      await axios.put('/api/admin/config', parsed);
      alert('Configuration saved');
      loadTabData();
    } catch (err) {
      alert('Invalid JSON or save failed');
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/admin-users', newAdmin);
      setNewAdmin({ username: '', email: '', password: '' });
      loadTabData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const removeAdmin = async (id) => {
    if (!window.confirm('Remove this admin?')) return;
    try {
      await axios.delete(`/api/admin/admin-users/${id}`);
      loadTabData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage users, messages, and app configuration</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === 'inbox' && stats.unreadComments > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.unreadComments}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-600" />
            </div>
          ) : (
            <>
              {tab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-purple-50 rounded-xl p-6">
                    <p className="text-sm text-purple-600 font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.totalUsers || 0}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-6">
                    <p className="text-sm text-indigo-600 font-medium">Total Messages</p>
                    <p className="text-3xl font-bold text-indigo-900">{stats.totalComments || 0}</p>
                  </div>
                  <div className="bg-pink-50 rounded-xl p-6">
                    <p className="text-sm text-pink-600 font-medium">Unread Messages</p>
                    <p className="text-3xl font-bold text-pink-900">{stats.unreadComments || 0}</p>
                  </div>
                </div>
              )}

              {tab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-3 pr-4">Username</th>
                        <th className="pb-3 pr-4">Email</th>
                        <th className="pb-3 pr-4">Joined</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-gray-50">
                          <td className="py-3 pr-4 font-medium">{u.username}</td>
                          <td className="py-3 pr-4">{u.email}</td>
                          <td className="py-3 pr-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 flex gap-2">
                            <button
                              onClick={() => promoteUser(u.id)}
                              className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-lg"
                            >
                              Make Admin
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg"
                            >
                              <FiTrash2 className="inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'inbox' && (
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No messages yet</p>
                  ) : (
                    comments.map((c) => (
                      <div
                        key={c.id}
                        className={`border rounded-lg p-4 ${c.read ? 'bg-gray-50' : 'bg-purple-50 border-purple-200'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-semibold text-gray-900">{c.username}</span>
                            {!c.read && (
                              <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">New</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{c.message}</p>
                        <div className="flex gap-2">
                          {!c.read && (
                            <button
                              onClick={() => markRead(c.id)}
                              className="text-xs flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg"
                            >
                              <FiCheck /> Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteComment(c.id)}
                            className="text-xs flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'config' && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Edit predefined categories (by gender), colors, seasons, occasions, and tags as JSON.
                  </p>
                  <textarea
                    value={configEdit}
                    onChange={(e) => setConfigEdit(e.target.value)}
                    rows={20}
                    className="w-full font-mono text-sm border rounded-lg p-4 mb-4"
                  />
                  <button
                    onClick={saveConfig}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Save Configuration
                  </button>
                </div>
              )}

              {tab === 'admins' && (
                <div>
                  <form onSubmit={createAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                    <input
                      placeholder="Username"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                      required
                    />
                    <input
                      placeholder="Email"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                      required
                    />
                    <input
                      placeholder="Password"
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      className="px-3 py-2 border rounded-lg"
                      required
                    />
                    <button type="submit" className="flex items-center justify-center gap-2 bg-purple-600 text-white rounded-lg py-2">
                      <FiPlus /> Add Admin
                    </button>
                  </form>
                  <div className="space-y-2">
                    {admins.map((a) => (
                      <div key={a.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <span className="font-semibold">{a.username}</span>
                          <span className="text-gray-400 mx-2">·</span>
                          <span className="text-sm text-gray-500">{a.email}</span>
                          <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            {a.role}
                          </span>
                        </div>
                        <button
                          onClick={() => removeAdmin(a.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
