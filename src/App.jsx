import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import axios from "axios";
import "./App.css";
import Swal from "sweetalert2";
import LocationMap from "./component/LocationMap"; // Ensure this path is correct

const base_url = import.meta.env.VITE_API_BASE_URL;

const App = () => {
  const center = [13.838487865712025, 100.02534086066446]; // SE NPRU
  const [stores, setStores] = useState([]);
  const [myLocation, setMyLocation] = useState({ lat: "", lng: "" });

  const [deliveryZone, setDeliveryZone] = useState({
    lat: 13.83231804, // ไรรดา (นครปฐม)
    lng: 100.04105221,
    radius: 1000,
  });

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
      try {
        const response = await axios.get(`${base_url}/api/stores`);
        if (response.status === 200) {
          setStores(response.data);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };
    fetchStores();
  }, []);

  const housingIcon = new Icon({
    iconUrl: "https://img.icons8.com/plasticine/100/exterior.png",
    iconSize: [38, 45], // Size of the icon
  });

  const shopIcon = new Icon({
    iconUrl: "https://img.icons8.com/plasticine/100/shop.png",
    iconSize: [38, 45], // Size of the icon
  });

  const handleGetLocation = () => {
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
        icon: "error",
        title: "Oops...",
        text: "Please enter a valid location!",
        confirmButtonText: "OK",
      });
      return;
    }
    if (!deliveryZone.lat || !deliveryZone.lng) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter a valid Store location!",
        confirmButtonText: "OK",
      });
      return;
    }
    const distance = calculateDistance(
      myLocation.lat,
      myLocation.lng,
      deliveryZone.lat,
      deliveryZone.lng
    );
    if (distance <= deliveryZone.radius) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "You are within the delivery zone",
        confirmButtonText: "OK",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You are outside the delivery zone",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div>
      <h1>Store Delivery Zone Checker</h1>
      <button onClick={handleGetLocation}>Get My Location</button>
      <button onClick={handleLocationCheck}>Check Delivery Availability</button>
      <div>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "75vh", width: "100vw" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Display all stores on map */}
          {stores.map((store) => (
            <Marker
              position={[store.lat, store.lng]}
              key={store.id}
              icon={shopIcon}
            >
              <Popup>
                <p>{store.name}</p>
                <p>{store.address}</p>
                <p>{store.raduis}</p>
                <a href={store.direction}>Get Direction</a>
              </Popup>
            </Marker>
          ))}
          {/* Choose Location on Map */}
          <MapMarker
            setMyLocation={setMyLocation}
            myLocation={myLocation}
            icon={housingIcon}
          />
        </MapContainer>
      </div>
    </div>
  );
};

const MapMarker = ({ setMyLocation, myLocation, icon }) => {
  useMapEvent({
    click(e) {
      const { lat, lng } = e.latlng;
      setMyLocation({ lat, lng });
      console.log("Click at latitude: " + lat + " longitude: " + lng);
    },
  });

  return myLocation.lat && myLocation.lng ? (
    <Marker position={[myLocation.lat, myLocation.lng]} icon={icon}>
      <Popup>
        A pretty CSS3 popup. <br /> Easily customizable.
      </Popup>
    </Marker>
  ) : null;
};

export default App;
