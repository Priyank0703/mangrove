import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDropzone } from 'react-dropzone';
import {
  Camera,
  MapPin,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  FileText,
  Globe
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SubmitReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cutting',
    severity: 'medium',
    location: {
      coordinates: {
        latitude: null,
        longitude: null
      },
      address: {
        city: '',
        state: '',
        country: ''
      }
    },
    tags: [],
    estimatedArea: {
      value: '',
      unit: 'sq_meters'
    },
    impactAssessment: {
      biodiversity: 'low',
      carbonStorage: 'low',
      coastalProtection: 'low'
    }
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [locationPermission, setLocationPermission] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: onDrop
  });

  function onDrop(acceptedFiles) {
    const newPhotos = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  }

  const removePhoto = (photoId) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === photoId);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter(p => p.id !== photoId);
    });
  };

  const requestLocationPermission = async () => {
    try {
      if (!('geolocation' in navigator)) {
        toast.error('Geolocation is not supported by this browser. Please enter coordinates manually.');
        return;
      }

      setLocationLoading(true);
      // Show loading state
      toast.loading('Requesting location permission...', { id: 'location' });

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            let errorMessage = 'Failed to get location. Please enter manually.';

            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location permission denied. Please allow location access or enter coordinates manually.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable. Please enter coordinates manually.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out. Please try again or enter coordinates manually.';
                break;
              default:
                errorMessage = 'Location error occurred. Please enter coordinates manually.';
            }
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
          }
        );
      });

      // Update form data with coordinates
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }
      }));

      setLocationPermission(true);
      toast.success('Location captured successfully!', { id: 'location' });

      // Clear any location errors
      if (errors.location) {
        setErrors(prev => ({ ...prev, location: '' }));
      }

    } catch (error) {
      console.error('Location permission error:', error);
      toast.error(error.message || 'Failed to get location. Please enter coordinates manually.', { id: 'location' });
      setLocationPermission(false);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name.includes('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          address: {
            ...prev.location.address,
            [field]: value
          }
        }
      }));
    } else if (name.includes('coordinates.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            ...prev.location.coordinates,
            [field]: parseFloat(value) || null
          }
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    // Validate location coordinates
    if (!formData.location.coordinates.latitude || !formData.location.coordinates.longitude) {
      newErrors.location = 'Location coordinates are required';
    } else {
      const lat = parseFloat(formData.location.coordinates.latitude);
      const lng = parseFloat(formData.location.coordinates.longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.location = 'Latitude must be between -90 and 90 degrees';
      } else if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.location = 'Longitude must be between -180 and 180 degrees';
      }
    }

    if (photos.length === 0) {
      newErrors.photos = 'At least one photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();

      // Add form data
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('severity', formData.severity);
      submitData.append('location', JSON.stringify(formData.location));

      if (formData.tags.length > 0) {
        submitData.append('tags', JSON.stringify(formData.tags));
      }

      if (formData.estimatedArea.value) {
        submitData.append('estimatedArea', JSON.stringify(formData.estimatedArea));
      }

      if (formData.impactAssessment) {
        submitData.append('impactAssessment', JSON.stringify(formData.impactAssessment));
      }

      // Add photos
      photos.forEach(photo => {
        submitData.append('photos', photo.file);
      });

      const response = await axios.post('/api/reports', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Report submitted successfully!');
      navigate('/reports');
    } catch (error) {
      console.error('Report submission error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit report';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cleanup photo previews on unmount
    return () => {
      photos.forEach(photo => {
        URL.revokeObjectURL(photo.preview);
      });
    };
  }, []);

  // Check if geolocation is supported
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      console.warn('Geolocation is not supported by this browser');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit Report</h1>
          <p className="text-gray-600 mt-2">
            Report a mangrove conservation incident with photos and location details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Brief description of the incident"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="cutting">Mangrove Cutting</option>
                  <option value="dumping">Waste Dumping</option>
                  <option value="reclamation">Land Reclamation</option>
                  <option value="pollution">Pollution</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Detailed description of the incident, including environmental impact..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity Level
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location Information
            </h2>

            <div className="mb-4">
              <button
                type="button"
                onClick={requestLocationPermission}
                disabled={locationLoading}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${locationPermission
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Globe className="w-4 h-4 mr-2" />
                {locationLoading ? 'Getting Location...' : locationPermission ? 'Location Captured ✓' : 'Get Current Location'}
              </button>

              {locationPermission && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Location captured successfully
                  </span>
                  <span className="text-sm text-gray-500">
                    ({formData.location.coordinates.latitude?.toFixed(6)}, {formData.location.coordinates.longitude?.toFixed(6)})
                  </span>
                </div>
              )}

              <p className="mt-2 text-sm text-gray-600">
                Click the button above to automatically capture your current location, or enter coordinates manually below.
              </p>

              {/* Additional guidance for location permission */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> If location permission is denied, you can:
                </p>
                <ul className="text-sm text-blue-700 mt-1 ml-4 list-disc">
                  <li>Click the browser's location permission icon in the address bar</li>
                  <li>Allow location access when prompted</li>
                  <li>Or enter coordinates manually in the fields below</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="coordinates.latitude"
                  value={formData.location.coordinates.latitude || ''}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="e.g., 12.3456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="coordinates.longitude"
                  value={formData.location.coordinates.longitude || ''}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="e.g., 78.9012"
                />
              </div>
            </div>

            {errors.location && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.location}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.location.address.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="City name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.location.address.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="State or province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.location.address.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Photo Documentation *
            </h2>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-green-600">Drop the photos here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop photos here, or click to select files
                  </p>
                  <p className="text-sm text-gray-500">
                    Maximum 5 photos, 5MB each. Supported formats: JPEG, PNG, GIF
                  </p>
                </div>
              )}
            </div>

            {errors.photos && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.photos}
              </p>
            )}

            {/* Photo Preview */}
            {photos.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Photos ({photos.length}/5)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.preview}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Area Affected
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    name="estimatedArea.value"
                    value={formData.estimatedArea.value}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Area value"
                  />
                  <select
                    name="estimatedArea.unit"
                    value={formData.estimatedArea.unit}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="sq_meters">Square Meters</option>
                    <option value="sq_kilometers">Square Kilometers</option>
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Impact Assessment
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Biodiversity Impact</label>
                  <select
                    name="impactAssessment.biodiversity"
                    value={formData.impactAssessment.biodiversity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Carbon Storage Impact</label>
                  <select
                    name="impactAssessment.carbonStorage"
                    value={formData.impactAssessment.carbonStorage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Coastal Protection Impact</label>
                  <select
                    name="impactAssessment.coastalProtection"
                    value={formData.impactAssessment.coastalProtection}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitReport;
