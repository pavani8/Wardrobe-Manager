import React, { useState, useEffect } from 'react';
import axios from '../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiGrid } from 'react-icons/fi';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGenderSelector, setShowGenderSelector] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const initializeCategories = async (gender) => {
    setInitializing(true);
    try {
      const response = await axios.post('/api/categories/initialize', { gender });
      await fetchCategories();
      setShowGenderSelector(false);
      alert(response.data.message || 'Categories initialized successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error initializing categories';
      console.error('Category initialization error:', error);
      alert(`Error: ${errorMessage}`);
    } finally {
      setInitializing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory.id}`, formData);
      } else {
        await axios.post('/api/categories', formData);
      }
      setShowModal(false);
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/categories/${id}`);
        fetchCategories();
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting category');
      }
    }
  };

  const openModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="mt-2 text-gray-600">Organize your dresses into categories</p>
          </div>
          <div className="flex space-x-3">
            {categories.length === 0 && (
              <button
                onClick={() => setShowGenderSelector(true)}
                className="inline-flex items-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Initialize Predefined Categories
              </button>
            )}
            <button
              onClick={openModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <FiPlus className="mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Gender Selector Modal */}
        {showGenderSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Initialize Predefined Categories</h2>
              <p className="text-gray-600 mb-6">
                Select your gender to automatically create predefined categories for your wardrobe.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => initializeCategories('male')}
                  disabled={initializing}
                  className="px-6 py-4 border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50"
                >
                  <div className="text-4xl mb-2">👔</div>
                  <div className="font-semibold">Male</div>
                  <div className="text-sm text-gray-500">Shirts, Jeans, Suits</div>
                </button>
                <button
                  onClick={() => initializeCategories('female')}
                  disabled={initializing}
                  className="px-6 py-4 border-2 border-pink-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors disabled:opacity-50"
                >
                  <div className="text-4xl mb-2">👗</div>
                  <div className="font-semibold">Female</div>
                  <div className="text-sm text-gray-500">Dresses, Tops, Skirts</div>
                </button>
                <button
                  onClick={() => initializeCategories('unisex')}
                  disabled={initializing}
                  className="px-6 py-4 border-2 border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <div className="text-4xl mb-2">👕</div>
                  <div className="font-semibold">Unisex</div>
                  <div className="text-sm text-gray-500">Casual, Sportswear</div>
                </button>
              </div>
              {initializing && (
                <div className="text-center text-gray-500 mb-4">
                  Initializing categories...
                </div>
              )}
              <button
                onClick={() => setShowGenderSelector(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FiGrid className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-500 mb-6">Create your first category to organize your dresses</p>
            <button
              onClick={openModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <FiPlus className="mr-2" />
              Create Category
            </button>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
              <p className="text-sm text-gray-500">Categories</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {categories.reduce((sum, c) => sum + (c.dressCount || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">Total Dresses</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FiGrid className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                <div className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-2">
                  {category.dressCount ?? 0} dress{(category.dressCount ?? 0) !== 1 ? 'es' : ''}
                </div>
                {category.description && (
                  <p className="text-gray-600 text-sm">{category.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-4">
                  Created {new Date(category.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Casual, Formal, Party"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 border border-transparent rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;

