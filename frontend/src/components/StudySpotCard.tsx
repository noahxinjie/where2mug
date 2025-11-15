import React, { useEffect, useState } from 'react';
import { StudySpot, Review } from '../types';
import { reviewApi, checkinApi } from '../services/api';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { MapPinIcon as MapPinIconOutline } from '@heroicons/react/24/outline';

interface StudySpotCardProps {
  spot: StudySpot;
  onViewDetails?: (spot: StudySpot) => void;
  onWriteReview?: (spot: StudySpot) => void;
}

const StudySpotCard: React.FC<StudySpotCardProps> = ({ spot, onViewDetails, onWriteReview }) => {
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [userCheckedIn, setUserCheckedIn] = useState(false);
  const [spotActiveCheckins, setSpotActiveCheckins] = useState(spot.active_checkins);

  useEffect(() => {
    // If backend already provided avg_rating (from search), use it and skip fetching reviews
    if (typeof spot.avg_rating === 'number') {
      setAvgRating(spot.avg_rating);
      // Can't know review count from spot.avg_rating alone; leave reviewCount as-is (0)
      return;
    }

    const fetchReviews = async () => {
      try {
        const response = await reviewApi.listBySpot(spot.id);
        const reviews: Review[] = response.data;

        if (reviews.length > 0) {
          const total = reviews.reduce((sum, r) => sum + r.rating, 0);
          setAvgRating(total / reviews.length);
          setReviewCount(reviews.length);
        } else {
          setAvgRating(null);
          setReviewCount(0);
        }
      } catch (err) {
        console.error('Failed to load reviews for study spot', spot.id, err);
      }
    };

    const checkUserCheckin = async () => {
      const storedUser = localStorage.getItem('user');
      const userId = storedUser ? JSON.parse(storedUser).id : null;
      if (!userId) return;

      try {
        const response = await checkinApi.getUserCheckinStatus(spot.id, userId);
        setUserCheckedIn(response.is_user_checkin);
      } catch (err) {
        console.error('Failed to check active check-ins', err);
      }
    };

    fetchReviews();
    checkUserCheckin();
  }, [spot.id]);

  const refreshCurrentCheckins = async () => {
  try {
    const response = await checkinApi.getStudySpotCheckinStatus(spot.id); // your endpoint that returns active_checkins
    setSpotActiveCheckins(response.active_checkins);
  } catch (err) {
    console.error("Failed to fetch active check-ins", err);
  }
};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Thumbnail area: show latest uploaded image (backend returns photos ordered newest-first) */}
      <div className="w-full h-40 bg-gray-100">
        {spot.photos && spot.photos.length > 0 ? (
          <img
            src={spot.photos[0].url}
            alt={spot.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {spot.name}
            </h3>
            
            <div className="flex items-center text-gray-600 mb-2">
              <MapPinIconOutline className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
              </span>
            </div>
            
            {spot.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {spot.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(spot.status)}`}>
                {spot.status.charAt(0).toUpperCase() + spot.status.slice(1)}
              </span>

              <div className="flex items-center text-sm text-gray-500">
                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                  {typeof spot.avg_rating === 'number' || reviewCount > 0 ? (
                    <>
                      <span>{(spot.avg_rating ?? avgRating)?.toFixed(1)}</span>
                      {reviewCount > 0 && <span className="ml-1">({reviewCount} reviews)</span>}
                    </>
                  ) : (
                    <span>No reviews</span>
                  )}
              </div>
            </div>

            <div className="text-sm text-gray-500 mt-2">
              Current Check-ins: <span className="font-medium">{spotActiveCheckins}</span>
            </div>
          </div>
        </div>
        
          {typeof spot.distance_km === 'number' && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-500">{spot.distance_km.toFixed(2)} km away</p>
            </div>
          )}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => onViewDetails?.(spot)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
          <button onClick={() => onWriteReview?.(spot)} 
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            Write Review
          </button>
        </div>
        {(() => {
          const storedUser = localStorage.getItem('user');
          const userId = storedUser ? JSON.parse(storedUser).id : null;

          if (userId && !userCheckedIn) {
            return (
              <div className="mt-2">
                <button onClick={async () => {
                  try {
                    await checkinApi.checkIn({ studyspot_id: spot.id, user_id: userId});
                    setUserCheckedIn(true);
                    await refreshCurrentCheckins();
                  } catch (err) {
                    console.error('Failed to check in', err);
                  }}}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                          Check In
                </button>
              </div>
              );
          }
          
          if (userId && userCheckedIn) {
            return (
              <div className="mt-2">
                <button onClick={async () => {
                  try {
                    await checkinApi.checkOut({ studyspot_id: spot.id, user_id: userId});
                    setUserCheckedIn(false);
                    await refreshCurrentCheckins();
                  } catch (err) {
                    console.error('Failed to check in', err);
                  }}}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors">
                  Check Out
                </button>
              </div>
              );
          }
           return null;  
        })()}



      </div>
    </div>
  );
};

export default StudySpotCard;
