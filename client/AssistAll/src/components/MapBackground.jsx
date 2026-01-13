import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import marker images directly
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component to move map view
const MapController = ({ location }) => {
    const map = useMap();
    useEffect(() => {
        if (location) {
            map.flyTo(location, 15, { duration: 2 });
        }
    }, [location, map]);
    return null;
};

const MapBackground = ({ activeRequest }) => {
  const defaultPos = [9.5916, 76.5222]; 
  const userPos = activeRequest?.location ? [activeRequest.location.lat, activeRequest.location.lng] : defaultPos;
  const [volPos, setVolPos] = useState([9.5940, 76.5240]); 

  // --- SAFE ICON DEFINITIONS (Inside Component) ---
  const UserIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
  });

  const VolunteerIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
  });

  const CarIcon = L.divIcon({
      html: '<div style="font-size: 24px;">🚖</div>',
      className: 'dummy', // Dummy class to prevent default styling
      iconSize: [30, 30],
      iconAnchor: [15, 15]
  });

  // Animation Logic
  useEffect(() => {
      if (activeRequest && (activeRequest.status === 'accepted' || activeRequest.status === 'in_progress')) {
          const interval = setInterval(() => {
              setVolPos(prev => {
                  const latDiff = userPos[0] - prev[0];
                  const lngDiff = userPos[1] - prev[1];
                  if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) return prev;
                  return [prev[0] + latDiff * 0.05, prev[1] + lngDiff * 0.05];
              });
          }, 500);
          return () => clearInterval(interval);
      }
  }, [activeRequest, userPos]);

  return (
    <div className="h-full w-full absolute inset-0 z-0 bg-gray-900">
      <MapContainer 
        center={userPos} 
        zoom={14} 
        style={{ height: "100%", width: "100%" }} 
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <MapController location={userPos} />

        <Marker position={userPos} icon={UserIcon}>
          <Popup>Customer Location</Popup>
        </Marker>

        {activeRequest && (
            <>
                <Marker position={volPos} icon={activeRequest.status === 'in_progress' ? CarIcon : VolunteerIcon}>
                    <Popup>{activeRequest.volunteerName || "Volunteer"}</Popup>
                </Marker>
                <Polyline positions={[volPos, userPos]} color="blue" dashArray="10, 10" opacity={0.5} />
            </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapBackground;