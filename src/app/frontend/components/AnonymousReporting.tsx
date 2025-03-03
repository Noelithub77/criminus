import React, { useState, useRef, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import "./AnonymousReporting.css"; // For styling
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { CloudOff } from "react-feather";
import Image from "next/image";

// Change from export to const to fix Next.js page export error
const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
const supabase = createClient();

const AnonymousReporting = () => {
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'audio'
  const [isRecording, setIsRecording] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Get current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      (error) => {
        console.error("Error getting current location:", error);
      }
    );
  }, []);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!, // Replace with your API key
  });
  const handleMapClick = (event) => {
    setLatitude(event.latLng.lat());
    setLongitude(event.latLng.lng());
  };

  const mapContainerStyle = {
    width: "100%",
    height: "160px",
  };

  // Provide default coordinates if latitude/longitude are null
  const center = {
    lat: latitude || 10.0555555, // Default to Kothamangalam coordinates
    lng: longitude || 76.6191,
  };
  // Handle file selection from gallery or camera
  const handleFileSelect = async (event, source) => {
    const file =
      source === "camera" ? event.target.files[0] : event.target.files[0];

    if (!file) return;

    setMediaType("image");
    setMediaFile(file);

    // Create preview for images
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        setMediaFile(audioBlob);
        setMediaPreview(audioUrl);
        setMediaType("audio");

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Upload file to Supabase storage
  const uploadFile = async () => {
    if (!mediaFile) return null;

    const fileExt =
      mediaType === "image" ? mediaFile.name.split(".").pop() : "wav";
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from("ReportedImages")
      .upload(filePath, mediaFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      return null;
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("ReportedImages").getPublicUrl(filePath);

    return publicUrl;
  };

  // Submit the report
  const handleSubmit = async () => {
    if (!description) {
      alert("Please provide a description");
      return;
    }

    setIsUploading(true);

    try {
      // Upload file if available
      const fileURL = mediaFile ? await uploadFile() : null;

      // Insert record into Supabase table
      const { data, error } = await supabase.from("ReportedMessages").insert([
        {
          description,
          latitude,
          longitude,
          fileURL,
        },
      ]);

      if (error) {
        throw error;
      }

      // Reset form
      setDescription("");
      setMediaFile(null);
      setMediaPreview(null);
      alert("Report submitted anonymously");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="anonymous-reporting-container">
      <div className="reporting-header">
        <h2>Anonymous Reporting</h2>
      </div>
      <div className="map-preview">
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={15}
            onClick={handleMapClick}
          >
            {latitude && longitude && (
              <Marker position={{ lat: latitude, lng: longitude }} />
            )}
          </GoogleMap>
        )}
      </div>
      <div className="location-info">
        {latitude && longitude && (
          <>
            <h4>Selected Location</h4>
            <p>Latitude: {latitude}</p>
            <p>Longitude: {longitude}</p>
          </>
        )}
      </div>
      <h4 style={{ color: "#84a9c0", fontSize: "16px" }}>
        Add other attachements
      </h4>
      {/* Media controls */}
      <div className="media-controls">
        <div className="media-button">
          <label htmlFor="camera-input">
            <div className="icon-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  fill="#84a9c0"
                  d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm6.5-11v-1h-13v1h13zm-1 1a1 1 0 0 0-1-1h-10a1 1 0 0 0-1 1v8a8 8 0 0 0 4 6.92V20h4v-2.08A8 8 0 0 0 17.5 7z"
                />
              </svg>
              <span>Camera</span>
            </div>
          </label>
          <input
            type="file"
            id="camera-input"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileSelect(e, "camera")}
            style={{ display: "none" }}
          />
        </div>

        <div className="media-button">
          {!isRecording ? (
            <div className="icon-button" onClick={startRecording}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  fill="#84a9c0"
                  d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V6z"
                />
                <path
                  fill="#84a9c0"
                  d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"
                />
              </svg>
              <span>Audio</span>
            </div>
          ) : (
            <div className="icon-button recording" onClick={stopRecording}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path fill="red" d="M6 6h12v12H6z" />
              </svg>
              <span>Stop</span>
            </div>
          )}
          {mediaType === "audio" && mediaPreview && (
            <audio
              ref={audioRef}
              src={mediaPreview}
              controls
              style={{ display: "none" }}
            />
          )}
        </div>

        <div className="media-button">
          <label htmlFor="gallery-input">
            <div className="icon-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  fill="#84a9c0"
                  d="M22 16V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"
                />
              </svg>
              <span>Gallery</span>
            </div>
          </label>
          <input
            type="file"
            id="gallery-input"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, "gallery")}
            style={{ display: "none" }}
          />
        </div>
      </div>
      {/* Preview area */}
      {mediaPreview && (
        <div className="media-preview">
          {mediaType === "image" ? (
            <Image
              src={mediaPreview}
              alt="Selected"
              width={300}
              height={200}
              style={{ objectFit: "contain" }}
            />
          ) : (
            <div className="audio-preview">
              <audio src={mediaPreview} controls />
            </div>
          )}
          <button
            className="remove-button"
            onClick={() => {
              setMediaFile(null);
              setMediaPreview(null);
            }}
          >
            ×
          </button>
        </div>
      )}
      {/* Description input */}
      <div className="description-container">
        <h4 style={{ color: "#84a9c0", fontSize: "16px" }}>Description</h4>
        <div className="text-input-container">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Text"
            rows={4}
          />
        </div>
      </div>
      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={isUploading}
        title="Submit report"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            fill="currentColor"
            d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
          />
        </svg>
      </button>
    </div>
  );
};

export default AnonymousReporting;
