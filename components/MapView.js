import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '400px' };
const center = { lat: -3.745, lng: -38.523 };

export default function MapView({ markers = [] }) {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}