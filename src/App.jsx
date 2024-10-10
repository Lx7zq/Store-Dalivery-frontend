import { useState, useEffect } from "react";
import L from "leaflet"; // Add this import
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet"; // Import Circle
import "leaflet/dist/leaflet.css";
import axios from "axios";
import "./App.css";
import Swal from "sweetalert2";
import LocationMap from "./component/LocationMap"; // Ensure this path is correct

const base_url = import.meta.env.VITE_API_BASE_URL;

// Define custom icons
const storeIcon = new L.Icon({
  iconUrl: "https://img.icons8.com/plasticine/100/shop.png",
  iconSize: [38, 38],
  iconAnchor: [22, 38],
  popupAnchor: [0, -40],
});

const houseIcon = new L.Icon({
  iconUrl: "https://img.icons8.com/plasticine/100/exterior.png",
  iconSize: [38, 38],
  iconAnchor: [22, 38],
  popupAnchor: [0, -40],
});

const selectedStoreIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/7877/7877890.png",
  iconSize: [38, 38],
  iconAnchor: [22, 38],
  popupAnchor: [0, -40],
});

const App = () => {
  const center = [13.838487865712025, 100.02534086066446]; // SE NPRU
  const [stores, setStores] = useState([]);
  const [myLocation, setMyLocation] = useState({ lat: "", lng: "" });
  const [selectedStore, setSelectedStore] = useState(null);
  const [deliveryZone, setDeliveryZone] = useState({
    lat: null,
    lng: null,
    radius: 1000,
  });
  const [loading, setLoading] = useState(true); // Add loading state

  // Function to calculate distance between 2 points using Haversine Formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Earth radius in meters
    const phi_1 = (lat1 * Math.PI) / 180;
    const phi_2 = (lat2 * Math.PI) / 180;

    const delta_phi = ((lat2 - lat1) * Math.PI) / 180;
    const delta_lambda = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(delta_phi / 2) * Math.sin(delta_phi / 2) +
      Math.cos(phi_1) *
        Math.cos(phi_2) *
        Math.sin(delta_lambda / 2) *
        Math.sin(delta_lambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.get(`${base_url}/api/stores`);
        if (response.status === 200) {
          setStores(response.data);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    };
    fetchStores();
  }, []);

  const handlerGetLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setMyLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  };

  const handleLocationCheck = () => {
    if (!myLocation.lat || !myLocation.lng) {
      Swal.fire({
        title: "Error!",
        text: "Please enter your valid location",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!selectedStore) {
      Swal.fire({
        title: "Error!",
        text: "Please select a store",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const distance = calculateDistance(
      myLocation.lat,
      myLocation.lng,
      selectedStore.lat,
      selectedStore.lng
    );

    // เปลี่ยนจาก deliveryZone.radius เป็น selectedStore.radius
    if (distance <= selectedStore.radius) {
      Swal.fire({
        title: "Success",
        text: "You are within the delivery zone for " + selectedStore.name,
        icon: "success",
        confirmButtonText: "OK",
      });
    } else {
      Swal.fire({
        title: "Error!",
        text: "You are outside the delivery zone for " + selectedStore.name,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <>
      <div className="header-container"></div>
      <div className="button-container">
        <button className="get-location-btn" onClick={handlerGetLocation}>
          Get My Location
        </button>
        <button className="get-location-btn" onClick={handleLocationCheck}>
          Check Delivery Availability
        </button>
      </div>

      <div>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "80vh", width: "100vw" }} // Adjust height to 80% of the viewport height
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {stores.length > 0 &&
            stores.map((store) => (
              <Marker
                key={store.id}
                position={[store.lat, store.lng]}
                icon={
                  selectedStore && selectedStore.id === store.id
                    ? selectedStoreIcon
                    : storeIcon
                }
                eventHandlers={{
                  click: () => {
                    setSelectedStore(store); // Set selected store
                  },
                }}
              >
                <Popup>
                  <b>{store.name}</b>
                  <p>{store.address}</p>
                  <p>Delivery Radius: {store.radius} meters</p>
                  <a href={store.direction}>Get Direction</a>
                </Popup>
              </Marker>
            ))}

          {/* Display delivery radius if a store is selected */}
          {selectedStore && (
            <>
              <Marker
                position={[selectedStore.lat, selectedStore.lng]}
                icon={selectedStoreIcon}
              >
                <Popup>
                  <b>{selectedStore.name}</b>
                  <p>{selectedStore.address}</p>
                  <p>Delivery Radius: {selectedStore.radius} meters</p>
                </Popup>
              </Marker>
              <Circle
                center={[selectedStore.lat, selectedStore.lng]}
                radius={selectedStore.radius} // Radius in metersฃ
                pathOptions={{
                  color: "blue",
                  fillColor: "blue",
                  fillOpacity: 0.2,
                }}
              />
            </>
          )}

          <LocationMap
            myLocation={myLocation}
            icon={houseIcon}
            onLocationSelect={setMyLocation} // Ensure correct function name
          />
        </MapContainer>
      </div>
    </>
  );
};

export default App;
