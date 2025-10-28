import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { StudySpot } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface StudySpotMapProps {
  spots: StudySpot[];
  center?: [number, number];
  zoom?: number;
}

const StudySpotMap: React.FC<StudySpotMapProps> = ({ 
  spots, 
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 13 
}) => {
  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-lg">{spot.name}</h3>
                <p className="text-gray-600 text-sm">{spot.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Status: {spot.status}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default StudySpotMap;
