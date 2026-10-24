import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../utils/api';
import PasswordInput from '../components/PasswordInput';
import { FiArrowLeft } from 'react-icons/fi';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Invalid reset link</p>
          <Link to="/forgot-password" className="text-purple-600">Request new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <Link to="/login" className="inline-flex items-center text-sm text-purple-600 mb-6">
          <FiArrowLeft className="mr-1" /> Back
        </Link>
        <h2 className="text-2xl font-bold mb-6">Set New Password</h2>
        {error && <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            {loading ? 'Saving...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
