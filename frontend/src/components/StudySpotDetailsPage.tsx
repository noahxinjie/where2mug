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
  const [uploading, setUploading] = useState(false);
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

  const handleFileUpload = async (file?: File) => {
    if (!file || !id) return;
    try {
      setUploading(true);
      // Request presigned data
      const presignResp = await studySpotApi.presignPhoto(Number(id), { filename: file.name, content_type: file.type });
      const { presigned, key, url } = presignResp.data;

      // Build form data from presigned fields
      const form = new FormData();
      Object.entries(presigned.fields).forEach(([k, v]) => form.append(k, v as string));
      form.append('file', file);

      // Upload directly to S3
      const uploadResult = await fetch(presigned.url, { method: 'POST', body: form });
      if (!uploadResult.ok) {
        throw new Error('Upload to S3 failed');
      }

      // Notify backend so it can persist metadata
      await studySpotApi.notifyPhoto(Number(id), { key, url, is_primary: false });

      // Refresh spot to show new photo
      const refreshed = await studySpotApi.get(id);
      setSpot(refreshed.data);
    } catch (err) {
      console.error('Failed to upload photo', err);
      setError('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

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

      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Photos</h3>
        <div className="mb-2">
          {spot.photos && spot.photos.length > 0 ? (
            <div className="flex space-x-2 overflow-x-auto py-2">
              {spot.photos.map((p) => (
                <img key={p.id} src={p.url} alt={`photo-${p.id}`} className="w-48 h-36 object-cover rounded-md shadow-sm flex-shrink-0" />
              ))}
            </div>
          ) : (
            <div className="w-64 h-40 bg-gray-100 flex items-center justify-center text-gray-400 rounded-md">No photos yet</div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (f) handleFileUpload(f);
            }}
          />
          {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
        </div>

        <p className="text-sm text-gray-500 mt-2">You can upload your own photo (jpeg/png file) of the place.</p>
      </div>

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
                <p className="text-sm text-gray-500 mt-1">By {review.user_name ?? `User ${review.user_id}`}</p>
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