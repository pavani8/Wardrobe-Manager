import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/api';
import PasswordInput from '../components/PasswordInput';
import { FiUser, FiArrowLeft, FiMail, FiSmartphone } from 'react-icons/fi';

const ForgotPassword = () => {
  const [step, setStep] = useState('choose');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devInfo, setDevInfo] = useState(null);

  const requestReset = async (method) => {
    setError('');
    setMessage('');
    setDevInfo(null);
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { username, method });
      setMessage(res.data.message);
      if (res.data.devOtp) setDevInfo({ otp: res.data.devOtp });
      if (res.data.devResetLink) setDevInfo({ link: res.data.devResetLink });
      if (method === 'otp') setStep('otp');
      else setStep('email-sent');
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed');
    }
    setLoading(false);
  };

  const resetWithOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password-otp', { username, otp, newPassword });
      setMessage('Password reset successfully! You can now sign in.');
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <Link to="/login" className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 mb-6">
          <FiArrowLeft className="mr-1" /> Back to login
        </Link>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h2>
        <p className="text-gray-500 text-sm mb-6">Choose how you want to reset your password</p>

        {error && <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
        {message && <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{message}</div>}
        {devInfo?.otp && (
          <div className="mb-4 bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            Dev OTP: <strong>{devInfo.otp}</strong>
          </div>
        )}
        {devInfo?.link && (
          <div className="mb-4 bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg text-sm break-all">
            Dev link: <a href={devInfo.link} className="underline">{devInfo.link}</a>
          </div>
        )}

        {step === 'choose' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Your username"
                />
              </div>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => requestReset('otp')}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-purple-200 rounded-lg hover:bg-purple-50 font-medium text-purple-700"
              >
                <FiSmartphone /> Reset via OTP
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => requestReset('email')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium"
              >
                <FiMail /> Reset via Email Link
              </button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <form onSubmit={resetWithOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>
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
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 'email-sent' && (
          <p className="text-gray-600 text-sm">
            Check your email for the reset link. In development mode, use the link shown above.
          </p>
        )}

        {step === 'done' && (
          <Link to="/login" className="block text-center py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
            Go to Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
