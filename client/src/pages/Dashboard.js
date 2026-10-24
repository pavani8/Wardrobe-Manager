import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/api';
import { getImageUrl } from '../utils/api';
import { FiGrid, FiPlus, FiTrendingUp, FiCamera, FiUpload } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDresses: 0,
    totalCategories: 0,
    recentDresses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dressesRes, categoriesRes] = await Promise.all([
        axios.get('/api/dresses'),
        axios.get('/api/categories')
      ]);

      const dresses = dressesRes.data;
      const categories = categoriesRes.data;

      setStats({
        totalDresses: dresses.length,
        totalCategories: categories.length,
        recentDresses: dresses.slice(-6).reverse()
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your wardrobe management system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiGrid className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Dresses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDresses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiTrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-pink-100 rounded-lg">
                <FiCamera className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Quick Actions</p>
                <Link
                  to="/add-dress"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Add New Dress →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/add-dress"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-all transform hover:scale-105"
          >
            <div className="flex items-center">
              <FiPlus className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-xl font-bold">Add New Dress</h3>
                <p className="text-purple-100 mt-1">Upload or capture a photo of your dress</p>
              </div>
            </div>
          </Link>

          <Link
            to="/bulk-upload"
            className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-all transform hover:scale-105"
          >
            <div className="flex items-center">
              <FiUpload className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-xl font-bold">Bulk Upload</h3>
                <p className="text-pink-100 mt-1">Upload multiple dresses at once</p>
              </div>
            </div>
          </Link>

          <Link
            to="/categories"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-all transform hover:scale-105"
          >
            <div className="flex items-center">
              <FiGrid className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-xl font-bold">Manage Categories</h3>
                <p className="text-indigo-100 mt-1">Organize your dresses by categories</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Dresses */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Dresses</h2>
            <Link
              to="/dresses"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {stats.recentDresses.length === 0 ? (
            <div className="text-center py-12">
              <FiGrid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No dresses yet</p>
              <Link
                to="/add-dress"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <FiPlus className="mr-2" />
                Add Your First Dress
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.recentDresses.map((dress) => (
                <Link
                  key={dress.id}
                  to={`/dresses`}
                  className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:scale-105 bg-gray-100"
                >
                  {dress.imageUrl ? (
                    <img
                      src={getImageUrl(dress.imageUrl)}
                      alt={dress.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
                      <div className="text-center p-4">
                        <div className="text-3xl mb-1">👗</div>
                        <p className="text-xs text-gray-600">No Image</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <p className="font-semibold text-sm truncate">{dress.name || 'Untitled Dress'}</p>
                      <p className="text-xs text-gray-200">{dress.categoryName}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

