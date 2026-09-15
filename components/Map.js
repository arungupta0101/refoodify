import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons in Next.js safely
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Component to update map center & invalidate container dimensions on mount/tab change
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center);
    }
    // Invalidate size to ensure container renders tiles completely without gray gaps
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [center, map]);
  return null;
}

export default function Map({ center, markers, selectedMarker, setSelectedMarker, radius, children }) {
  const defaultCenter = center || [26.7606, 83.3697];

  return (
    <div className="w-full h-full min-h-[400px] relative z-0">
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={defaultCenter} />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* User Location Marker (Blue) */}
        {center && (
          <Marker position={center} icon={new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Search Radius Circle */}
        {radius && center && (
          <Circle center={center} radius={radius * 1000} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }} />
        )}

        {/* Other Markers */}
        {markers && markers.map((marker, idx) => (
          <Marker
            key={marker.id || marker._id || idx}
            position={[marker.lat, marker.lng]}
            eventHandlers={{
              click: () => setSelectedMarker && setSelectedMarker(marker),
            }}
            icon={new L.Icon({
              iconUrl: marker.type === 'donation'
                ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png' // Green for Donations
                : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png', // Orange for Restaurants
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}
          />
        ))}

        {/* Popup for Selected Marker */}
        {selectedMarker && selectedMarker.lat && selectedMarker.lng && (
          <Popup
            position={[selectedMarker.lat, selectedMarker.lng]}
            onClose={() => setSelectedMarker && setSelectedMarker(null)}
          >
            {children}
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}