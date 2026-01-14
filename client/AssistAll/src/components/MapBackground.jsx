import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import marker images directly to avoid missing asset errors
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

  // ✅ FIX: Define icons inside the component using useMemo to prevent load crashes
  const icons = useMemo(() => ({
      user: new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
      }),
      volunteer: new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
      }),
      car: L.divIcon({
          html: '<div style="font-size: 24px;">🚖</div>',
          className: 'dummy',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
      })
  }), []);

  // Animation Logic: Move Volunteer to User
  useEffect(() => {
      if (activeRequest && (activeRequest.status === 'accepted' || activeRequest.status === 'in_progress')) {
          const interval = setInterval(() => {
              setVolPos(prev => {
                  const latDiff = userPos[0] - prev[0];
                  const lngDiff = userPos[1] - prev[1];
                  
                  // Stop if close enough
                  if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) return prev;

                  // Move 5% closer every tick
                  return [prev[0] + latDiff * 0.05, prev[1] + lngDiff * 0.05];
              });
          }, 500); // Update every 500ms
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

        <Marker position={userPos} icon={icons.user}>
          <Popup>Customer Location</Popup>
        </Marker>

        {activeRequest && (
            <>
                <Marker position={volPos} icon={activeRequest.status === 'in_progress' ? icons.car : icons.volunteer}>
                    <Popup>{activeRequest.volunteerName || "Volunteer"}</Popup>
                </Marker>
                {/* Route Line */}
                <Polyline positions={[volPos, userPos]} color="blue" dashArray="10, 10" opacity={0.5} />
            </>
        )}

      </MapContainer>
    </div>
  );
};

export default MapBackground;