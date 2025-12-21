import React, { useState } from "react";
import UploadForm from "./UploadForm";
import WebcamCapture from "./WebcamCapture";

// Language-based text (Keeping the translations as is)
const translations = {
  en: {
    welcome: "Welcome to Sign Speak",
    select: "Select Input Mode",
    upload: "Upload Image",
    webcam: "Use Webcam",
  },
  hi: {
    welcome: "SignSpeak में आपका स्वागत है",
    select: "इनपुट मोड चुनें",
    upload: "चित्र अपलोड करें",
    webcam: "वेबकैम का उपयोग करें",
  },
  bn: {
    welcome: "Sign Speak-এ আপনাকে স্বাগতম",
    select: "ইনপুট মোড নির্বাচন করুন",
    upload: "ছবি আপলোড করুন",
    webcam: "ওয়েবক্যাম ব্যবহার করুন",
  },
  mr: {
    welcome: "Sign Speak मध्ये आपले स्वागत आहे",
    select: "इनपुट मोड निवडा",
    upload: "प्रतिमा अपलोड करा",
    webcam: "वेबकॅम वापरा",
  },
  ta: {
    welcome: "SignSpeak இற்குப் வரவேற்கிறோம்",
    select: "உள்ளீட்டு முறையைத் தேர்ந்தெடுக்கவும்",
    upload: "படத்தை பதிவேற்றவும்",
    webcam: "வெப்கேமைக் பயன்படுத்தவும்",
  },
  te: {
    welcome: "సైన్‌స్పీక్‌కు స్వాగతం",
    select: "ఇన్‌పుట్ మోడ్‌ను ఎంచుకోండి",
    upload: "చిత్రాన్ని అప్‌లోడ్ చేయండి",
    webcam: "వెబ్‌క్యామ్ ఉపయోగించండి",
  },
};

const ChoicePage = ({ language }) => {
  const [choice, setChoice] = useState(null);
  const [loadingMode, setLoadingMode] = useState(null);
  const [hoverUpload, setHoverUpload] = useState(false);
  const [hoverWebcam, setHoverWebcam] = useState(false);

  const handleBack = () => {
    setLoadingMode(null);
    setChoice(null);
  };

  const handleChoice = (mode) => {
    setLoadingMode(mode);

    setTimeout(() => {
      setChoice(mode);
    }, 600);
  };

  const t = translations[language] || translations.en;

  if (choice === "upload")
    return <UploadForm goBack={handleBack} language={language} />;
  if (choice === "webcam")
    return <WebcamCapture goBack={handleBack} language={language} />;


  // ---Color Palette Styles ---
  const PRIMARY_COLOR = "#00796b"; // Deep Teal
  const ACCENT_COLOR = "#80cbc4"; // Light Teal/Mint for hover/text
  const BACKGROUND_COLOR = "rgba(38, 50, 56, 0.7)"; // Dark Slate Grey with transparency for overlay
  const CARD_COLOR = "rgba(55, 71, 79, 0.9)"; // Darker card background with slight transparency
  const WHITE_TEXT = '#ffffff';

  // --- FULL-SCREEN CSS CHANGES with Background Image ---
  const BACKGROUND_IMAGE_URL = '/images/Image.png';
  const mainContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    
    // **Background Image Styles:**
    backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
    backgroundSize: 'cover', 
    backgroundPosition: 'center', 
    backgroundRepeat: 'no-repeat',
    backgroundColor: BACKGROUND_COLOR,
    backgroundBlendMode: 'multiply',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  };
  // ---  END FULL-SCREEN CSS CHANGES ---

  const contentBoxStyle = {
    backgroundColor: CARD_COLOR,
    padding: '50px',
    borderRadius: '15px',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.7)', // Increased shadow for contrast
    textAlign: 'center',
    width: '90%',
    maxWidth: '500px',
    transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
    animation: 'slideIn 0.8s ease-out', 
    // Added zIndex to ensure it's above the background
    zIndex: 10, 
  };
  
  const headerStyle = {
    color: ACCENT_COLOR,
    marginBottom: '10px',
    fontWeight: 600,
    letterSpacing: '1px',
    textShadow: '2px 2px 5px rgba(0, 0, 0, 0.8)', // Stronger shadow for readability
  };

  const subHeaderStyle = {
    color: WHITE_TEXT, // Changed sub-header color for better contrast
    marginBottom: '40px',
    fontWeight: 300,
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
  };

  const buttonStyle = {
    margin: "15px",
    padding: "18px 40px",
    fontSize: "18px",
    cursor: "pointer",
    borderRadius: "30px",
    border: `2px solid ${PRIMARY_COLOR}`,
    fontWeight: "bold",
    letterSpacing: "1px",
    transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
    color: WHITE_TEXT,
    backgroundColor: PRIMARY_COLOR,
    boxShadow: '0 8px 25px rgba(0, 121, 107, 0.4)',
    position: 'relative',
    overflow: 'hidden',
  };

  const buttonActiveStyle = {
    transform: 'scale(0.98)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    backgroundColor: PRIMARY_COLOR,
  };
  
  const buttonHoverStyle = {
    backgroundColor: ACCENT_COLOR, // Changed hover background to ACCENT_COLOR
    color: PRIMARY_COLOR, // Changed hover text color
    boxShadow: '0 12px 30px rgba(0, 121, 107, 0.6)',
    transform: 'scale(1.03) translateY(-2px)',
    borderColor: ACCENT_COLOR,
  };
  
  const spinnerStyle = {
      border: `3px solid ${WHITE_TEXT}33`,
      borderTop: `3px solid ${WHITE_TEXT}`,
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      animation: 'spin 1s linear infinite',
      display: 'inline-block',
      verticalAlign: 'middle',
      marginRight: '10px',
  };

  const getButtonStyle = (mode) => {
      const isHovering = (mode === 'upload' && hoverUpload) || (mode === 'webcam' && hoverWebcam);
      const isActive = mode === loadingMode;
      const isDisabled = loadingMode && (loadingMode !== mode);

      return {
          ...buttonStyle,
          ...(isActive ? buttonActiveStyle : {}),
          ...(!isActive && isHovering ? buttonHoverStyle : {}),
          opacity: isDisabled ? 0.5 : 1, 
          pointerEvents: loadingMode ? 'none' : 'auto', 
      };
  };

  // Render the Choice Page
  return (
    <div style={mainContainerStyle}>
        <div style={contentBoxStyle}>
            <h1 style={headerStyle}>{t.welcome}</h1>
            <h3 style={subHeaderStyle}>{t.select}</h3>

            {/* Upload Button */}
            <button
              onClick={() => handleChoice("upload")}
              style={getButtonStyle("upload")}
              onMouseEnter={() => setHoverUpload(true)}
              onMouseLeave={() => setHoverUpload(false)}
            >
              {loadingMode === 'upload' ? (
                  <>
                    <div className="spinner" style={spinnerStyle} />
                    Processing...
                  </>
              ) : (
                  t.upload
              )}
            </button>

            {/* Webcam Button */}
            <button
              onClick={() => handleChoice("webcam")}
              style={getButtonStyle("webcam")}
              onMouseEnter={() => setHoverWebcam(true)}
              onMouseLeave={() => setHoverWebcam(false)}
            >
              {loadingMode === 'webcam' ? (
                  <>
                    <div className="spinner" style={spinnerStyle} />
                    Processing...
                  </>
              ) : (
                  t.webcam
              )}
            </button>
        </div>
    </div>
  );
};

export default ChoicePage;