import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StudySpot, Review } from '../types';
import { studySpotApi, reviewApi } from '../services/api';
import { StarIcon } from '@heroicons/react/24/solid';

const StudySpotDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [spot, setSpot] = useState<StudySpot | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingSpot, setLoadingSpot] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const fetchSpot = async () => {
      try {
        setLoadingSpot(true);
        const response = await studySpotApi.get(id);
        setSpot(response.data);
      } catch (err) {
        setError('Failed to fetch study spot');
        console.error('Error fetching spot:', err);
      } finally {
        setLoadingSpot(false);
      }
    };

    fetchSpot();
  }, [id]);

  // Fetch reviews for the spot
  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await reviewApi.listBySpot(Number(id));
        setReviews(response.data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id]);

  if (loadingSpot) return <p>Loading spot...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!spot) return <p>Study spot not found</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <button onClick={() => navigate(-1)} 
      className="mb-6 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        &larr; Back
      </button>

    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{spot.name}</h1>
      <p className="text-gray-600 mb-2">{spot.description}</p>
      <p className="text-gray-500 text-sm">
        Location: {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
      </p>
      <p className="text-gray-500 text-sm mb-4">Status: {spot.status}</p>

      <h2 className="text-xl font-semibold mb-4">Reviews</h2>
      {loadingReviews ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="border p-4 rounded-md bg-white shadow-sm flex justify-between items-center">
              {/* Review Content */}
              <div>
                <p className="text-gray-800">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-1">By User {review.user_id}</p>
              </div>

              {/* Rating Badge */}
              <div className="ml-4 flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-lg">
                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" /> {review.rating}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
    </div>
  );
};

export default StudySpotDetailsPage;