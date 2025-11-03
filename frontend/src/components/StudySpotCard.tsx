import React from 'react';
import { StudySpot } from '../types';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { MapPinIcon as MapPinIconOutline } from '@heroicons/react/24/outline';

interface StudySpotCardProps {
  spot: StudySpot;
  onViewDetails?: (spot: StudySpot) => void;
  onWriteReview?: (spot: StudySpot) => void;
}

const StudySpotCard: React.FC<StudySpotCardProps> = ({ spot, onViewDetails, onWriteReview }) => {
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
                <span>4.2</span>
                <span className="ml-1">(12 reviews)</span>
              </div>
            </div>
          </div>
        </div>
        
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
      </div>
    </div>
  );
};

export default StudySpotCard;
