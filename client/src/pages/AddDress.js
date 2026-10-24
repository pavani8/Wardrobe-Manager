import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/api';
import ImageEditor from '../components/ImageEditor';
import { FiUpload, FiCamera, FiX, FiInfo, FiPlus } from 'react-icons/fi';

const AddDress = () => {
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
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [showGenderSelector, setShowGenderSelector] = useState(false);
  const [predefinedSeasons, setPredefinedSeasons] = useState([]);
  const [predefinedOccasions, setPredefinedOccasions] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editorSrc, setEditorSrc] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [initializing, setInitializing] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchPredefinedData();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
      if (response.data.length === 0) {
        setShowGenderSelector(true);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPredefinedData = async () => {
    try {
      const [predefRes, tagsRes] = await Promise.all([
        axios.get('/api/dresses/predefined/data'),
        axios.get('/api/tags')
      ]);
      setPredefinedColors(predefRes.data.colors || []);
      setPredefinedTags(predefRes.data.tags || []);
      setPredefinedSeasons(predefRes.data.seasons || []);
      setPredefinedOccasions(predefRes.data.occasions || []);
      setCustomTags(tagsRes.data.custom || []);
    } catch (error) {
      console.error('Error fetching predefined data:', error);
    }
  };

  const openEditor = (src) => {
    setEditorSrc(src);
    setShowEditor(true);
  };

  const handleEditorSave = (file, preview) => {
    setImage(file);
    setImagePreview(preview);
    setShowEditor(false);
    setEditorSrc(null);
  };

  const initializeCategories = async (gender) => {
    setInitializing(true);
    try {
      const response = await axios.post('/api/categories/initialize', { gender });
      await fetchCategories();
      setShowGenderSelector(false);
      setError('');
      // Show success message
      if (response.data.message) {
        alert(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error initializing categories';
      console.error('Category initialization error:', error);
      setError(errorMessage);
    } finally {
      setInitializing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      stopCamera();
      const reader = new FileReader();
      reader.onloadend = () => openEditor(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera not available. Use HTTPS or upload a photo instead.');
      return;
    }
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setCameraError('Camera requires HTTPS on mobile. Use Upload Photo or access via localhost.');
      return;
    }
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      setCameraActive(true);
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Camera error:', error);
      let msg = 'Could not access camera. ';
      if (error.name === 'NotAllowedError') {
        msg += 'Please allow camera permission in browser settings.';
      } else if (error.name === 'NotFoundError') {
        msg += 'No camera found on this device.';
      } else {
        msg += 'Try uploading a photo instead.';
      }
      setCameraError(msg);
    }
  };

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.error('Video play error:', err));
    }
  }, [cameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !videoRef.current.videoWidth) {
      setCameraError('Camera not ready. Wait a moment and try again.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    stopCamera();
    openEditor(canvas.toDataURL('image/jpeg'));
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => {
      const tags = prev.tags || [];
      if (tags.includes(tag)) {
        return { ...prev, tags: tags.filter(t => t !== tag) };
      }
      return { ...prev, tags: [...tags, tag] };
    });
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

  const allTags = [...new Set([...predefinedTags, ...customTags])];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Only categoryId is mandatory
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      if (image) {
        data.append('image', image);
      }
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('categoryId', formData.categoryId);
      data.append('color', formData.color);
      data.append('season', formData.season);
      data.append('occasion', formData.occasion);
      data.append('tags', JSON.stringify(formData.tags));

      await axios.post('/api/dresses', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/dresses');
    } catch (error) {
      setError(error.response?.data?.error || 'Error adding dress');
      setLoading(false);
    }
  };

  // Gender selector for initializing categories
  if (showGenderSelector && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Initialize Your Wardrobe</h2>
            <p className="text-gray-600 mb-6">
              Select your gender to automatically create predefined categories for your wardrobe.
            </p>
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="mt-6 text-center text-gray-500">
                Initializing categories...
              </div>
            )}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/categories')}
                className="text-purple-600 hover:text-purple-700 text-sm"
              >
                Or create custom categories manually →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0 && !showGenderSelector) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Categories Found</h2>
            <p className="text-gray-600 mb-6">
              Please create a category first before adding dresses.
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Dress</h1>
          <p className="mt-2 text-gray-600">Add a new item to your wardrobe (only category is required)</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {cameraError && (
              <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
                {cameraError}
              </div>
            )}

            {/* Image Upload Section - Optional */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dress Photo (Optional)
              </label>
              <div className="space-y-4">
                {!cameraActive && !imagePreview && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 active:bg-purple-100 transition-colors touch-manipulation min-h-[48px]"
                    >
                      <FiUpload className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-gray-600 font-medium">Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex-1 flex items-center justify-center px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 active:bg-purple-100 transition-colors touch-manipulation min-h-[48px]"
                    >
                      <FiCamera className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-gray-600 font-medium">Take Photo</span>
                    </button>
                  </div>
                )}

                {cameraActive && (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 sm:h-96 object-cover rounded-lg bg-gray-200"
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full px-4 sm:w-auto">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 active:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 touch-manipulation min-h-[48px] font-medium"
                      >
                        Capture
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 active:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 touch-manipulation min-h-[48px] font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditor(imagePreview)}
                        className="px-3 py-1 bg-white/90 text-purple-700 rounded-lg text-sm font-medium shadow"
                      >
                        Crop / Rotate
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dress Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Blue Denim Jeans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color (Optional)
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
                  Season (Optional)
                </label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
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
                  Occasion (Optional)
                </label>
                <select
                  value={formData.occasion}
                  onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select occasion</option>
                  {predefinedOccasions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Create custom tag"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button type="button" onClick={addCustomTag} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                  <FiPlus className="inline" /> Add Tag
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  Selected: {formData.tags.join(', ')}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="Optional description about the dress"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <FiInfo className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <strong>Note:</strong> Only the category field is required. All other fields including image are optional.
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dresses')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 border border-transparent rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Dress'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showEditor && editorSrc && (
        <ImageEditor
          imageSrc={editorSrc}
          onSave={handleEditorSave}
          onCancel={() => { setShowEditor(false); setEditorSrc(null); }}
        />
      )}
    </div>
  );
};

export default AddDress;
