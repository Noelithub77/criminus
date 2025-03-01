import React, { useState, useEffect } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { Send, Camera } from "react-feather";

const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} 
const supabase = createClient()
function SendMessage() {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

    useEffect(() => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          const video = document.getElementById("video") as HTMLVideoElement;
          if (video) {
            video.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
        });
    }, []);
  // useEffect(() => {
  //   navigator.mediaDevices
  //     .getUserMedia({ video: { facingMode: { exact: "environment" } } })
  //     .then((stream) => {
  //       const video = document.getElementById("video");
  //       video.srcObject = stream;
  //     })
  //     .catch((err) => {
  //       console.error("Error accessing camera:", err);
  //     });
  // }, []);

  const handleCapture = () => {
    const video = document.getElementById("video") as HTMLVideoElement;
    if (!video) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          setImage(blob);
        }
      }, "image/jpeg");
    }
  };

  const uploadImageToSupabase = async (imageBlob: Blob) => {
    if (!imageBlob) {
      console.error("Error: No image data to upload!");
      return;
    }

    const fileName = `${Date.now()}.jpg`;

    console.log("Uploading image:", fileName);

    const { data, error } = await supabase.storage
      .from("ReportedImages")
      .upload(fileName, imageBlob, {
        contentType: "image/jpeg",
      });

    if (error) {
      console.error("Supabase Upload Error:", error);
      return null;
    }

    console.log("Upload successful:", data);

    // Construct the correct public URL
    const { data: urlData } = supabase.storage
      .from("ReportedImages")
      .getPublicUrl(fileName); // Use fileName instead of data.path

    if (!urlData || !urlData.publicUrl) {
      console.error("Error getting public URL:", urlData);
      return null;
    }

    console.log("Uploaded file URL:", urlData.publicUrl);
    return urlData.publicUrl;
  };
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    let uploadedImageUrl = imageUrl;

    if (image && !imageUrl) {
      try {
        uploadedImageUrl = await uploadImageToSupabase(image);
        setImageUrl(uploadedImageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    const { data, error } = await supabase
      .from("ReportedMessages")
      .insert([{ message, fileURL: uploadedImageUrl }]);

    if (error) {
      console.error("Error inserting message:", error);
    } else {
      console.log("Message inserted:", data);
      setMessage("");
      setImage(null);
      setImageUrl(null);
      setSuccess(true);
    }
  };

  return (
    <div className="anonymousReportingContainer">
      {success && (
        <div className="anonymousReportingSuccess">
          Your report has been sent safely! Rest easy—it&apos;s securely and
          anonymously in the right hands. We&apos;ve got you!
        </div>
      )}
      <div className="cameraFeed">
        <video id="video" width="240" height="320" autoPlay></video>
        <button
          className="anonymousReportingCameraButton"
          type="button"
          onClick={handleCapture}
          title="Capture photo"
        >
          <Camera />
        </button>
      </div>
      <div className="anonymousReportingForm">
        <input
          className="anonymousReportingInput"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a description"
        />
        <button 
          className="anonymousReportingButton" 
          onClick={handleSubmit}
          title="Send report"
        >
          <Send />
        </button>
      </div>
    </div>
  );
}

export default SendMessage;
