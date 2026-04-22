// import {
//   GoogleMap,
//   LoadScript,
//   Marker,
//   InfoWindow,
// } from "@react-google-maps/api";

// import { useState } from "react";

// const containerStyle = {
//   width: "100%",
//   height: "500px",
// };

// function MapView({ mosques, userLocation }) {
//   const [selected, setSelected] = useState(null);
//   const openDirections = (mosque) => {
//   const lat =
//     typeof mosque.geometry.location.lat === "function"
//       ? mosque.geometry.location.lat()
//       : mosque.geometry.location.lat;

//   const lng =
//     typeof mosque.geometry.location.lng === "function"
//       ? mosque.geometry.location.lng()
//       : mosque.geometry.location.lng;

//   const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

//   window.open(url, "_blank");
// };

// const libraries = ["places"];

//   return (
//     <LoadScript
//       googleMapsApiKey="AIzaSyAyDnakJmkBAu8CVIXgXSPZy3THkwoQVp8"
//         libraries={libraries}
     
//     >
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={
//           userLocation || { lat: 6.5244, lng: 3.3792 }
//         }
//         zoom={13}
//       >
//         {/* USER LOCATION */}
//         {userLocation && (
//           <Marker position={userLocation} />
//         )}

//         {/* MOSQUE MARKERS */}
//         {mosques.map((mosque, index) => (
//           <Marker
//             // key={index}
//             // position={{
//             //   lat: mosque.geometry.location.lat(),
//             //   lng: mosque.geometry.location.lng(),
//             // }}
//              onClick={() => setSelected(mosque)}
//           />
//         ))}

//    <div>
//       <h2>Nearby Ahmadiyya Mosques</h2>
//       {mosques.length === 0 && (
//         <p style={{ color: "red" }}>
//           No Ahmadiyya mosques found nearby
//         </p>
//       )}

//       <MapView
//         mosques={mosques}
//         userLocation={userLocation}
//         openDirections={openDirections}

//       />
//     </div>  
// {selected && (
//   <InfoWindow
//     position={{
//       lat: selected.geometry.location.lat(),
//       lng: selected.geometry.location.lng(),
//     }}
//     onCloseClick={() => setSelected(null)}
//   >
//     <div style={{ padding: "10px", minWidth: "200px" }}>
//       <h4>{selected.name}</h4>
//       <p>{selected.vicinity}</p>

//       {/* 🚗 ADD BUTTON HERE */}
//       <button
//         onClick={() => openDirections(selected)}
//         style={{
//           padding: "8px 12px",
//           backgroundColor: "#007bff",
//           color: "white",
//           border: "none",
//           borderRadius: "5px",
//           width: "100%",
//           cursor: "pointer",
//         }}
//       >
//         Get Directions
//       </button>
//     </div>
//   </InfoWindow>
// )}
//       </GoogleMap>
//     </LoadScript>

    
//   );
// }

// export default MapView;