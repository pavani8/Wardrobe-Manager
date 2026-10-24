import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../utils/api';
import { getImageUrl } from '../utils/api';
import { FiUpload, FiX, FiPlus } from 'react-icons/fi';

const EditDress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    color: '',
    season: '',
    occasion: '',
    tags: []
  });
  const [categories, setCategories] = useState([]);
  const [predefinedColors, setPredefinedColors] = useState([]);
  const [predefinedTags, setPredefinedTags] = useState([]);
  const [predefinedSeasons, setPredefinedSeasons] = useState([]);
  const [predefinedOccasions, setPredefinedOccasions] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [dressRes, catRes, predefRes, tagsRes] = await Promise.all([
        axios.get(`/api/dresses/${id}`),
        axios.get('/api/categories'),
        axios.get('/api/dresses/predefined/data'),
        axios.get('/api/tags')
      ]);

      const dress = dressRes.data;
      setFormData({
        name: dress.name || '',
        description: dress.description || '',
        categoryId: dress.categoryId,
        color: dress.color || '',
        season: dress.season || '',
        occasion: dress.occasion || '',
        tags: dress.tags || []
      });
      setExistingImage(dress.imageUrl || '');
      setImagePreview(dress.imageUrl ? getImageUrl(dress.imageUrl) : null);
      setCategories(catRes.data);
      setPredefinedColors(predefRes.data.colors || []);
      setPredefinedTags(predefRes.data.tags || []);
      setPredefinedSeasons(predefRes.data.seasons || []);
      setPredefinedOccasions(predefRes.data.occasions || []);
      setCustomTags(tagsRes.data.custom || []);
      setLoading(false);
    } catch (err) {
      setError('Dress not found');
      setLoading(false);
    }
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const addCustomTag = async () => {
    if (!newTag.trim()) return;
    try {
      await axios.post('/api/tags', { name: newTag.trim() });
      setCustomTags((prev) => [...prev, newTag.trim()]);
      handleTagToggle(newTag.trim());
      setNewTag('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add tag');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      setError('Category is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = new FormData();
      if (image) data.append('image', image);
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('categoryId', formData.categoryId);
      data.append('color', formData.color);
      data.append('season', formData.season);
      data.append('occasion', formData.occasion);
      data.append('tags', JSON.stringify(formData.tags));

      await axios.put(`/api/dresses/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/dresses');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
      setSaving(false);
    }
  };

  const allTags = [...new Set([...predefinedTags, ...customTags])];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Dress</h1>
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(existingImage ? getImageUrl(existingImage) : null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                  >
                    <FiX />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer hover:border-purple-500">
                  <FiUpload className="mr-2" /> Upload new photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImage(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Category <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select color</option>
                  {predefinedColors.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Season</label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select season</option>
                  {predefinedSeasons.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Occasion</label>
                <select
                  value={formData.occasion}
                  onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select occasion</option>
                  {predefinedOccasions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.tags.includes(tag)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Create custom tag"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button type="button" onClick={addCustomTag} className="px-4 py-2 bg-gray-100 rounded-lg text-sm">
                  <FiPlus className="inline" /> Add
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => navigate('/dresses')} className="flex-1 py-3 border rounded-lg">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDress;
