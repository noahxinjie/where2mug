import React, { useState, useEffect } from 'react';
import { StudySpot, ReviewCreate } from '../types';
import { studySpotApi, reviewApi } from '../services/api';
import StudySpotCard from './StudySpotCard';
import StudySpotMap from './StudySpotMap';
import { MagnifyingGlassIcon, MapIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const StudySpotList: React.FC = () => {
  const [spots, setSpots] = useState<StudySpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const navigate = useNavigate();

    // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<StudySpot | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const response = await studySpotApi.list();
      setSpots(response.data);
    } catch (err) {
      setError('Failed to fetch study spots');
      console.error('Error fetching spots:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSpots = spots.filter(spot =>
    spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spot.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openReviewModal = (spot: StudySpot) => {
    setSelectedSpot(spot);
    setNewComment('');
    setNewRating(5);
    setIsModalOpen(true);
  };

  const handleViewDetails = (spot: StudySpot) => {
    // TODO: Implement spot details modal or navigation
    console.log('View details for:', spot);
    navigate(`/studyspots/${spot.id}`);
  };

  const handleSubmitReview = async () => {
  if (!selectedSpot) return;
  setSubmitting(true);
  setModalError(null);
  try {
    const reviewData: ReviewCreate = {
      studyspot_id: selectedSpot.id,
      comment: newComment,
      rating: newRating,
      user_id: 1, // replace with logged-in user ID
    };
    const response = await reviewApi.create(reviewData);
    console.log('Review submitted:', response.data);
    setIsModalOpen(false);
  } catch (err: any) {
    if (err.response?.data?.detail) {
      setModalError(err.response.data.detail);
    } else {
      setModalError('Failed to submit review. Please try again.');
    }
    console.error('Failed to submit review', err);
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchSpots}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Study Spots</h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <MapIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search study spots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {filteredSpots.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No study spots found matching your search.' : 'No study spots available yet.'}
          </p>
          {!searchTerm && (
            <p className="text-gray-400 mt-2">
              Be the first to add a study spot!
            </p>
          )}
        </div>
      ) : viewMode === 'map' ? (
        <StudySpotMap spots={filteredSpots} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpots.map((spot) => (
            <StudySpotCard
              key={spot.id}
              spot={spot}
              onViewDetails={handleViewDetails}
              onWriteReview={openReviewModal}
            />
          ))}
        </div>
      )}

      {isModalOpen && selectedSpot && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Write a Review for {selectedSpot.name}</h3>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Your review..."
              className="w-full border rounded-md p-2 mb-3"
              rows={4}
            />
            <div className="flex items-center mb-4">
              <label className="mr-2">Rating:</label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="border rounded-md p-1"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 rounded-md bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            {modalError && (
              <p className="text-red-500 text-center mt-2">{modalError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudySpotList;
