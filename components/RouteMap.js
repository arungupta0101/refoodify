import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in Next.js safely
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

// Component to handle map clicks and set starting location pin
function LocationPicker({ onSelectLocation }) {
    useMapEvents({
        click(e) {
            if (onSelectLocation) {
                onSelectLocation(e.latlng.lat, e.latlng.lng);
            }
        }
    });
    return null;
}

// Helper component to auto-fit map view bounds around all route markers & recalculate container size
function FitRouteBounds({ points }) {
    const map = useMap();
    useEffect(() => {
        if (map) {
            const timer = setTimeout(() => {
                map.invalidateSize();
            }, 200);

            if (points && points.length > 0) {
                const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }

            return () => clearTimeout(timer);
        }
    }, [points, map]);
    return null;
}

// Custom Leaflet DivIcon generator for Numbered Sequence Markers
function createSequenceIcon(number, urgency = 'Medium') {
    if (typeof window === 'undefined' || !L || !L.divIcon) return undefined;
    const bgColor = urgency === 'High' ? '#e11d48' : (urgency === 'Medium' ? '#f59e0b' : '#10b981');
    const html = `
    <div style="
      background-color: ${bgColor};
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">
      ${number}
    </div>
  `;
    return L.divIcon({
        className: 'custom-sequence-marker',
        html,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });
}

function getBlueMarkerIcon() {
    if (typeof window === 'undefined' || !L || !L.Icon) return undefined;
    return new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
}

export default function RouteMap({ startLocation, routeSequence, onStartLocationChange }) {
    const center = startLocation ? [startLocation.lat, startLocation.lng] : [26.7606, 83.3697];
    const markerRef = useRef(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null && onStartLocationChange) {
                    const latLng = marker.getLatLng();
                    onStartLocationChange(latLng.lat, latLng.lng);
                }
            },
        }),
        [onStartLocationChange]
    );

    // Combine all points for path polyline (Start -> Pickup 1 -> Pickup 2...)
    const allPoints = [];
    if (startLocation && startLocation.lat && startLocation.lng) {
        allPoints.push({ lat: startLocation.lat, lng: startLocation.lng });
    }
    if (Array.isArray(routeSequence)) {
        routeSequence.forEach(item => {
            if (item && item.lat && item.lng) {
                allPoints.push({ lat: item.lat, lng: item.lng, ...item });
            }
        });
    }

    const polylinePositions = allPoints.map(p => [p.lat, p.lng]);
    const blueIcon = useMemo(() => getBlueMarkerIcon(), []);

    return (
        <div className="w-full h-full min-h-[380px] rounded-2xl overflow-hidden relative z-0 border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '1rem' }}>
                <FitRouteBounds points={allPoints} />
                <LocationPicker onSelectLocation={onStartLocationChange} />

                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Street Map">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Satellite">
                        <TileLayer
                            attribution='Tiles &copy; Esri'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {/* Start Location Marker (Blue - Draggable & Clickable) */}
                {startLocation && blueIcon && (
                    <Marker
                        draggable={true}
                        eventHandlers={eventHandlers}
                        ref={markerRef}
                        position={[startLocation.lat, startLocation.lng]}
                        icon={blueIcon}
                    >
                        <Popup>
                            <div className="p-1">
                                <span className="font-extrabold text-blue-600 uppercase text-[10px] block">Start / Driver Location (Drag Me!)</span>
                                <h4 className="font-bold text-slate-800 text-xs mt-0.5">{startLocation.address || 'Starting Point'}</h4>
                                <p className="text-[10px] text-slate-500 mt-1 font-semibold">📍 Drag pin or click map to move starting point</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Numbered Sequence Markers */}
                {routeSequence && routeSequence.map((point, index) => (
                    <Marker
                        key={point.id || index}
                        position={[point.lat, point.lng]}
                        icon={createSequenceIcon(index + 1, point.urgency)}
                    >
                        <Popup>
                            <div className="p-1 text-slate-900">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-extrabold text-[10px]">
                                        Stop #{index + 1}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${point.urgency === 'High'
                                        ? 'bg-rose-100 text-rose-700'
                                        : (point.urgency === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                                        }`}>
                                        {point.urgency} Urgency
                                    </span>
                                </div>
                                <h4 className="font-extrabold text-sm">{point.name}</h4>
                                <p className="text-xs text-slate-600 mt-1">🍱 {point.foodType} ({point.quantity})</p>
                                <p className="text-xs text-slate-500 mt-0.5">📍 {point.address}</p>
                                {point.distanceFromPrevKm > 0 && (
                                    <p className="text-[11px] font-bold text-emerald-600 mt-1">
                                        🚗 +{point.distanceFromPrevKm} km from previous stop
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Polyline Route Line */}
                {polylinePositions.length > 1 && (
                    <Polyline
                        positions={polylinePositions}
                        pathOptions={{
                            color: '#10b981',
                            weight: 5,
                            opacity: 0.85,
                            dashArray: '8, 8'
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
}
