import React, { useState } from "react";
import { Marker, Popup, useMapEvent } from "react-leaflet";
import L from "leaflet"; // Import Leaflet for icons

// Define your icons based on location type
const icons = {
  myLocation: new L.Icon({
    iconUrl: "https://img.icons8.com/plasticine/100/exterior.png", // User's location icon
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  shopLocation: new L.Icon({
    iconUrl: "https://img.icons8.com/plasticine/100/shop.png", // Shop location icon
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

const LocationMap = ({
  setDeliveryZone,
  setMyLocation,
  label,
  locationType,
}) => {
  const [location, setLocation] = useState({ lat: "", lng: "" });

  // Event handler for map clicks
  useMapEvent({
    click(e) {
      const { lat, lng } = e.latlng;
      setLocation({ lat, lng });
      console.log(`Click at latitude: ${lat}, longitude: ${lng}`);

      // Update location based on the type
      if (locationType === "myLocation") {
        setMyLocation({ lat, lng });
      } else if (locationType === "shopLocation") {
        setDeliveryZone({ lat, lng });
      }
    },
  });

  // Render the marker only if the location is set
  return location.lat && location.lng ? (
    <Marker position={[location.lat, location.lng]} icon={icons[locationType]}>
      <Popup>
        {label} <br /> Latitude: {location.lat}, Longitude: {location.lng}
      </Popup>
    </Marker>
  ) : null;
};

export default LocationMap;
