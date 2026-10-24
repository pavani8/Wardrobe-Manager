import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/api';
import { FiUpload, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

const BulkUpload = () => {
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    categoryId: '',
    defaultColor: '',
    defaultSeason: '',
    defaultOccasion: '',
    defaultTags: []
  });
  const [predefinedColors, setPredefinedColors] = useState([]);
  const [predefinedTags, setPredefinedTags] = useState([]);
  const [predefinedSeasons, setPredefinedSeasons] = useState([]);
  const [predefinedOccasions, setPredefinedOccasions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchPredefinedData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
      if (response.data.length === 0) {
        setError('Please create a category first before uploading dresses.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPredefinedData = async () => {
    try {
      const response = await axios.get('/api/dresses/predefined/data');
      setPredefinedColors(response.data.colors || []);
      setPredefinedTags(response.data.tags || []);
      setPredefinedSeasons(response.data.seasons || []);
      setPredefinedOccasions(response.data.occasions || []);
    } catch (error) {
      console.error('Error fetching predefined data:', error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('Please select at least one image file');
      return;
    }

    if (imageFiles.length > 50) {
      setError('Maximum 50 images can be uploaded at once');
      return;
    }

    // Create preview URLs for selected files
    const filesWithPreview = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setSelectedFiles(prev => [...prev, ...filesWithPreview]);
    setError('');
  };

  const removeFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    // Revoke object URL to free memory
    URL.revokeObjectURL(selectedFiles[index].preview);
    setSelectedFiles(updatedFiles);
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => {
      const tags = prev.defaultTags || [];
      if (tags.includes(tag)) {
        return { ...prev, defaultTags: tags.filter(t => t !== tag) };
      } else {
        return { ...prev, defaultTags: [...tags, tag] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploadProgress(0);

    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select at least one image to upload');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      
      // Append all files
      selectedFiles.forEach((fileObj) => {
        data.append('images', fileObj.file);
      });

      // Append form data
      data.append('categoryId', formData.categoryId);
      data.append('defaultColor', formData.defaultColor);
      data.append('defaultSeason', formData.defaultSeason);
      data.append('defaultOccasion', formData.defaultOccasion);
      data.append('defaultTags', JSON.stringify(formData.defaultTags));

      // Upload with progress tracking
      setUploadProgress(10); // Initial progress
      const response = await axios.post('/api/dresses/bulk', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          } else {
            // If total is not available, use a simple increment
            setUploadProgress(prev => Math.min(prev + 10, 90));
          }
        }
      });
      setUploadProgress(100);

      setSuccess(`Successfully uploaded ${response.data.count} dresses!`);
      setSelectedFiles([]);
      setFormData({
        categoryId: formData.categoryId, // Keep category selected
        defaultColor: '',
        defaultSeason: '',
        defaultOccasion: '',
        defaultTags: []
      });
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dresses');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Error uploading dresses');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(fileObj => {
        URL.revokeObjectURL(fileObj.preview);
      });
    };
  }, [selectedFiles]);

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Categories Found</h2>
            <p className="text-gray-600 mb-6">
              Please create a category first before uploading dresses.
            </p>
            <button
              onClick={() => navigate('/categories')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              Go to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Dresses</h1>
          <p className="mt-2 text-gray-600">Upload multiple photos at once under one category (Max 50 images)</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <FiAlertCircle className="mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                <FiCheck className="mr-2" />
                {success}
              </div>
            )}

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* File Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Images <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-2">(You can select multiple files, max 50)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <FiUpload className="mr-2" />
                  Select Images
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedFiles.length > 0 
                    ? `${selectedFiles.length} image(s) selected`
                    : 'Click to select images or drag and drop'}
                </p>
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {selectedFiles.map((fileObj, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={fileObj.preview}
                          alt={fileObj.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                      <p className="mt-1 text-xs text-gray-600 truncate" title={fileObj.name}>
                        {fileObj.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Color (Optional)
                </label>
                <select
                  value={formData.defaultColor}
                  onChange={(e) => setFormData({ ...formData, defaultColor: e.target.value })}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select color</option>
                  {predefinedColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Season (Optional)
                </label>
                <select
                  value={formData.defaultSeason}
                  onChange={(e) => setFormData({ ...formData, defaultSeason: e.target.value })}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select season</option>
                  {predefinedSeasons.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Occasion (Optional)
                </label>
                <select
                  value={formData.defaultOccasion}
                  onChange={(e) => setFormData({ ...formData, defaultOccasion: e.target.value })}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select occasion</option>
                  {predefinedOccasions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {predefinedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.defaultTags.includes(tag)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {formData.defaultTags.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  Selected: {formData.defaultTags.join(', ')}
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {loading && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Uploading...</span>
                  <span className="text-sm text-gray-500">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dresses')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedFiles.length === 0}
                className="flex-1 px-4 py-2 border border-transparent rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? `Uploading... ${uploadProgress}%` : `Upload ${selectedFiles.length} Image(s)`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;

