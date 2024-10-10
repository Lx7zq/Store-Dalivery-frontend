// icons.js
import L from "leaflet";

export const icons = {
  myLocation: new L.Icon({
    iconUrl: "https://img.icons8.com/plasticine/100/exterior.png",
    iconSize: [38, 38],
    iconAnchor: [22, 38],
    popupAnchor: [0, -40],
  }),
  shopLocation: new L.Icon({
    iconUrl: "https://img.icons8.com/plasticine/100/shop.png",
    iconSize: [38, 38],
    iconAnchor: [22, 38],
    popupAnchor: [0, -40],
  }),
  selectedStoreIcon: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/7877/7877890.png", 
    iconSize: [38, 38],
    iconAnchor: [22, 38],
    popupAnchor: [0, -40],
  }),
};

export default icons;
