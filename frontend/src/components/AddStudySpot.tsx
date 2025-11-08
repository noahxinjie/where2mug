import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudySpotCreate } from '../types';
import { studySpotApi } from '../services/api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Autocomplete from 'react-google-autocomplete';

const AddStudySpot: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StudySpotCreate>({
    name: '',
    place_id: '',
    latitude: 0,
    longitude: 0,
    status: 'pending',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [formattedAddress, setFormattedAddress] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await studySpotApi.create(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create study spot');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Add Study Spot</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Search for Location *
              </label>
              <Autocomplete
                apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                onPlaceSelected={(place) => {
                  if (place && place.place_id && place.geometry) {
                    setFormData({
                      ...formData,
                      name: place.name || '',
                      place_id: place.place_id,
                      latitude: place.geometry.location.lat(),
                      longitude: place.geometry.location.lng()
                    });
                    setSelectedPlace(place);
                    setFormattedAddress(place.formatted_address || '');
                  }
                }}
                options={{
                  types: ['establishment'],
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid rgb(209, 213, 219)',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              />
              {formattedAddress && (
                <p className="mt-2 text-sm text-green-600">
                  ✅ Location selected: {formattedAddress}
                </p>
              )}
              {selectedPlace && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      name: '',
                      place_id: '',
                      latitude: 0,
                      longitude: 0
                    });
                    setSelectedPlace(null);
                    setFormattedAddress('');
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear selection and search again
                </button>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name * (editable)
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter study spot name"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe this study spot..."
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.place_id}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>{loading ? 'Creating...' : 'Create Study Spot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudySpot;
