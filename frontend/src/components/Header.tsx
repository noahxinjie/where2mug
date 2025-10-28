import React from 'react';
import { Link } from 'react-router-dom';
import { MapIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <MapIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Where2Mug</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Study Spots
            </Link>
            <Link
              to="/add-spot"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Spot</span>
            </Link>
            <Link
              to="/register"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <UserIcon className="h-4 w-4" />
              <span>Register</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
