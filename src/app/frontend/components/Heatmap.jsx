// pages/crime-heatmap.js
import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

// Define crime types with associated colors
const CRIME_TYPES = {
  THEFT: { color: "#FF0000", label: "Theft" }, // Red
  ASSAULT: { color: "#FFA500", label: "Assault" }, // Orange
  VANDALISM: { color: "#FFFF00", label: "Vandalism" }, // Yellow
  FRAUD: { color: "#800080", label: "Fraud" }, // Purple
  DRUG: { color: "#008000", label: "Drug Offenses" }, // Green
};

// Sample crime data with locations
const crimeData = [
  {
    id: 1,
    type: "THEFT",
    location: { lat: 10.0522345, lng: 76.6141 },
    count: 45,
  },
  {
    id: 2,
    type: "ASSAULT",
    location: { lat: 10.0515555, lng: 76.6091 },
    count: 23,
  },
  {
    id: 3,
    type: "VANDALISM",
    location: { lat: 10.0575555, lng: 76.6191 },
    count: 18,
  },
  {
    id: 4,
    type: "FRAUD",
    location: { lat: 10.0545555, lng: 76.6241 },
    count: 12,
  },
  {
    id: 5,
    type: "DRUG",
    location: { lat: 10.0512555, lng: 76.6041 },
    count: 29,
  },
  {
    id: 6,
    type: "THEFT",
    location: { lat: 10.0535555, lng: 76.6141 },
    count: 37,
  },
  {
    id: 7,
    type: "ASSAULT",
    location: { lat: 10.0595555, lng: 76.6191 },
    count: 19,
  },
];

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "12px",
};

// Centered on Kothamangalam, Kerala as mentioned in your image
const center = {
  lat: 10.0555555,
  lng: 76.6191,
};

// CSS styles for the page
const styles = `
  .crime-reporting-container {
    padding: 16px;
    max-width: 500px;
    margin: 0 auto;
    background-color: #121212;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .header h1 {
    font-size: 18px;
    margin: 0;
  }

  .header-icons {
    display: flex;
    gap: 16px;
  }

  .reporting-section h2 {
    display: flex;
    align-items: center;
    font-size: 18px;
    margin-bottom: 16px;
  }

  .reporting-section h2 svg {
    margin-right: 8px;
  }

  .location-info {
    margin: 16px 0;
  }

  .location-name {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .location-address {
    font-size: 14px;
    color: #aaa;
  }

  .action-buttons {
    display: flex;
    justify-content: space-between;
    margin: 24px 0;
  }

  .action-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #2a2a2a;
    border-radius: 8px;
    padding: 16px;
    width: 30%;
  }

  .action-button svg {
    margin-bottom: 8px;
  }

  .action-button-text {
    font-size: 12px;
  }

  .description-section {
    margin-top: 24px;
  }

  .description-section h3 {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .description-input {
    width: 100%;
    height: 100px;
    background-color: #2a2a2a;
    border: none;
    border-radius: 8px;
    padding: 12px;
    color: white;
    resize: none;
  }

  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-around;
    background-color: #1a1a1a;
    padding: 12px 0;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
    color: #aaa;
  }

  .nav-item.active {
    color: #3498db;
  }

  .nav-icon {
    margin-bottom: 4px;
  }

  .legend {
    margin-top: 16px;
    padding: 12px;
    background-color: #2a2a2a;
    border-radius: 8px;
  }

  .legend-title {
    font-weight: bold;
    margin-bottom: 8px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    margin-right: 8px;
  }
`;

export default function CrimeHeatmap() {
  const { isLoaded } = useJsApiLoader({
    id: "script-loader",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY, // Replace with your actual API key
  });

  const [map, setMap] = useState(null);
  // const [heatmap, setHeatmap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    if (map) {
      setMap(map);
      // Ensure center is set with valid coordinates
      map.setCenter(center);
    }
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Create custom markers for each crime based on type and count
  const markers = crimeData.map((crime) => {
    const crimeInfo = CRIME_TYPES[crime.type];
    // Size of marker increases with count
    const scale = 1 + crime.count / 50;

    return (
      <Marker
        key={crime.id}
        position={{
          lat: crime.location.lat || 10.0555555,
          lng: crime.location.lng || 76.6191
        }}
        icon={{
          path: "M-10,0a10,10 0 1,0 20,0a10,10 0 1,0 -20,0",
          fillColor: crimeInfo.color,
          fillOpacity: 0.8,
          strokeWeight: 0,
          scale: scale,
        }}
        title={`${crimeInfo.label}: ${crime.count} incidents`}
      />
    );
  });

  return (
    <>
      <style jsx global>
        {styles}
      </style>
      <div className="crime-reporting-container">
        <section className="reporting-section">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={14}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                styles: [
                  {
                    featureType: "all",
                    elementType: "all",
                    stylers: [{ saturation: -100 }],
                  },
                ],
                streetViewControl: false,
                mapTypeControl: false,
              }}
            >
              {markers}
            </GoogleMap>
          ) : (
            <div
              style={{
                ...mapContainerStyle,
                backgroundColor: "#ccc",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Loading map...
            </div>
          )}

          <div className="location-info">
            <div className="location-name">MACE</div>
            <div className="location-address">Kothamangalam, Kerala</div>
          </div>

          <div className="legend">
            <div className="legend-title">Crime Frequency Heatmap</div>
            {Object.entries(CRIME_TYPES).map(([key, value]) => (
              <div key={key} className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: value.color }}
                ></div>
                <div>{value.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
