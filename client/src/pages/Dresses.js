import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/api';
import { getImageUrl } from '../utils/api';
import { FiFilter, FiSearch, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';

const Dresses = () => {
  const [dresses, setDresses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ colors: [], seasons: [], occasions: [], tags: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoryId: '',
    color: '',
    season: '',
    occasion: '',
    tag: '',
    search: ''
  });
  const [selectedDress, setSelectedDress] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchDresses();
  }, [filters.categoryId, filters.color, filters.season, filters.occasion, filters.tag]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await axios.get('/api/tags/filter-options');
      setFilterOptions(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDresses = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
      const res = await axios.get(`/api/dresses?${params.toString()}`);
      setDresses(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this dress?')) return;
    try {
      await axios.delete(`/api/dresses/${id}`);
      fetchDresses();
      if (selectedDress?.id === id) setSelectedDress(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Delete failed');
    }
  };

  const filteredDresses = dresses.filter((dress) => {
    if (!filters.search) return true;
    const q = filters.search.toLowerCase();
    return (
      dress.name?.toLowerCase().includes(q) ||
      dress.description?.toLowerCase().includes(q)
    );
  });

  const clearFilters = () => {
    setFilters({ categoryId: '', color: '', season: '', occasion: '', tag: '', search: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dresses</h1>
            <p className="mt-2 text-gray-600">{filteredDresses.length} items in your wardrobe</p>
          </div>
          <Link
            to="/add-dress"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Add Dress
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-purple-600" />
            <span className="font-medium text-gray-700">Filters</span>
            {(filters.categoryId || filters.color || filters.season || filters.occasion || filters.tag) && (
              <button onClick={clearFilters} className="ml-auto text-sm text-purple-600 hover:text-purple-700">
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <div className="relative col-span-1 sm:col-span-2">
              <FiSearch className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm"
              />
            </div>
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              className="px-3 py-2.5 border rounded-lg text-sm bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={filters.color}
              onChange={(e) => setFilters({ ...filters, color: e.target.value })}
              className="px-3 py-2.5 border rounded-lg text-sm bg-white"
            >
              <option value="">All Colors</option>
              {filterOptions.colors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={filters.season}
              onChange={(e) => setFilters({ ...filters, season: e.target.value })}
              className="px-3 py-2.5 border rounded-lg text-sm bg-white"
            >
              <option value="">All Seasons</option>
              {filterOptions.seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={filters.occasion}
              onChange={(e) => setFilters({ ...filters, occasion: e.target.value })}
              className="px-3 py-2.5 border rounded-lg text-sm bg-white"
            >
              <option value="">All Occasions</option>
              {filterOptions.occasions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <select
              value={filters.tag}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
              className="px-3 py-2.5 border rounded-lg text-sm bg-white"
            >
              <option value="">All Tags</option>
              {filterOptions.tags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredDresses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">No dresses found</p>
            <Link to="/add-dress" className="text-purple-600 font-medium">Add your first dress</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredDresses.map((dress) => (
              <div
                key={dress.id}
                onClick={() => setSelectedDress(dress)}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer bg-gray-100"
              >
                {dress.imageUrl ? (
                  <img
                    src={getImageUrl(dress.imageUrl)}
                    alt={dress.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 text-4xl">
                    👗
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 p-3 text-white w-full">
                    <p className="font-semibold text-sm truncate">{dress.name || 'Untitled'}</p>
                    <p className="text-xs text-gray-300">{dress.categoryName}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/edit-dress/${dress.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(dress.id); }}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedDress && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDress(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {selectedDress.imageUrl ? (
                <img src={getImageUrl(selectedDress.imageUrl)} alt="" className="w-full h-64 object-cover rounded-t-2xl" />
              ) : (
                <div className="h-48 bg-purple-50 flex items-center justify-center text-6xl rounded-t-2xl">👗</div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedDress.name || 'Untitled'}</h2>
                  <button onClick={() => setSelectedDress(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <FiX />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{selectedDress.categoryName}</span>
                  {selectedDress.color && <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">{selectedDress.color}</span>}
                  {selectedDress.season && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{selectedDress.season}</span>}
                  {selectedDress.occasion && <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">{selectedDress.occasion}</span>}
                </div>
                {selectedDress.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedDress.tags.map((t) => (
                      <span key={t} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs">{t}</span>
                    ))}
                  </div>
                )}
                {selectedDress.description && <p className="text-gray-600 mb-4">{selectedDress.description}</p>}
                <div className="flex gap-3">
                  <Link
                    to={`/edit-dress/${selectedDress.id}`}
                    className="flex-1 text-center py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(selectedDress.id)}
                    className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dresses;
