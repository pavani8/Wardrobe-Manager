import React, { useState, useEffect } from 'react';
import axios from '../utils/api';
import { FiMessageSquare, FiSend, FiCheck } from 'react-icons/fi';

const Comments = () => {
  const [message, setMessage] = useState('');
  const [myComments, setMyComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyComments();
  }, []);

  const fetchMyComments = async () => {
    try {
      const res = await axios.get('/api/comments/mine');
      setMyComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/comments', { message });
      setMessage('');
      setSubmitted(true);
      fetchMyComments();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiMessageSquare className="text-purple-600" />
            Comments & Feedback
          </h1>
          <p className="mt-2 text-gray-600">Send a message to the admin team</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            {submitted && (
              <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <FiCheck /> Message sent to admin successfully!
              </div>
            )}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-none"
              placeholder="Share feedback, report issues, or suggest features..."
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium disabled:opacity-50"
            >
              <FiSend />
              {loading ? 'Sending...' : 'Submit to Admin'}
            </button>
          </form>
        </div>

        {myComments.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Previous Messages</h2>
            <div className="space-y-4">
              {myComments.map((c) => (
                <div key={c.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <p className="text-gray-800">{c.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
