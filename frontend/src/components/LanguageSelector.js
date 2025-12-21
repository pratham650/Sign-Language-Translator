import React, { useState } from 'react';

const languages = [
  { code: '', name: 'Select a Language' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', 'name': 'తెలుగు (Telugu)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
];

// --- 🎨 Color Palette (Unchanged) ---
const PRIMARY_ACCENT = "#FFD700";
const SECONDARY_BLUE = "#3f51b5";
const BACKGROUND_COLOR = "#212121";
const CARD_COLOR = "#424242";
const TEXT_COLOR_LIGHT = "#ffffff";
const TEXT_COLOR_DARK = "#212121";

// --- 💅 Base Component Styles (Unchanged) ---
const styles = {
    languageSelector: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: BACKGROUND_COLOR,
        fontFamily: 'Roboto, sans-serif',
        padding: '20px',
        boxSizing: 'border-box',
    },
    titleSection: {
        backgroundColor: CARD_COLOR,
        padding: '60px 50px',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        width: '90%',
        maxWidth: '500px',
        animation: 'slideIn 0.8s ease-out',
        position: 'relative',
        overflow: 'hidden',
    },
    title: {
        color: PRIMARY_ACCENT,
        marginBottom: '5px',
        fontWeight: 700,
        letterSpacing: '1px',
        fontSize: '2.5em',
        textTransform: 'uppercase',
    },
    subtitle: {
        color: SECONDARY_BLUE,
        marginBottom: '30px',
        fontStyle: 'italic',
        fontWeight: 400,
        textDecoration: 'underline',
    },
    heading: {
        color: TEXT_COLOR_LIGHT,
        marginTop: '20px',
        marginBottom: '20px',
        fontWeight: 500,
        fontSize: '1.2em',
    },
    dropdownContainer: {
        width: '80%',
        margin: '0 auto',
    },
    selectElement: {
        width: '100%',
        padding: '12px 15px',
        fontSize: '16px',
        borderRadius: '6px',
        border: `2px solid ${PRIMARY_ACCENT}`,
        backgroundColor: TEXT_COLOR_LIGHT,
        color: TEXT_COLOR_DARK,
        cursor: 'pointer',
        appearance: 'none',
        transition: 'border-color 0.3s ease',
    },
    submitButton: {
        marginTop: '25px',
        padding: '12px 40px',
        fontSize: '16px',
        fontWeight: 'bold',
        borderRadius: '30px', 
        border: 'none',
        backgroundColor: PRIMARY_ACCENT, 
        color: TEXT_COLOR_DARK, 
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
        transition: 'background-color 0.3s ease, transform 0.1s ease',
    },
    submitButtonHover: {
        backgroundColor: '#e6b800',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.6)',
    },
    submitButtonActive: {
        transform: 'scale(0.95)',
        backgroundColor: PRIMARY_ACCENT,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(66, 66, 66, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        opacity: 0,
        pointerEvents: 'none',
        transition: 'opacity 0.3s ease-out',
    },
    loadingVisible: {
        opacity: 1,
        pointerEvents: 'auto',
    },
    spinnerStyle: {
        border: '4px solid rgba(255, 255, 255, 0.3)',
        borderTop: `4px solid ${PRIMARY_ACCENT}`,
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        color: PRIMARY_ACCENT,
        marginTop: '15px',
        fontSize: '1.1em',
    }
};

// --- ⚛️ Component Function ---
function LanguageSelector({ onSelectLanguage }) {
    const [selectedCode, setSelectedCode] = useState('');
    const [isHovering, setIsHovering] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(false); 

    const handleSelectChange = (event) => {
        setSelectedCode(event.target.value);
    };
    
    const handleSubmit = () => {
        if (selectedCode && selectedCode !== '') {
            setIsActive(true);
            
            setTimeout(() => {
                setIsPageLoading(true);
                setIsActive(false);
            }, 100); 

            setTimeout(() => {
                onSelectLanguage(selectedCode);
            }, 1000); 
            
        }
    };

    const getButtonStyles = () => {
        // FIX: Create a shallow copy of the base style object using the spread operator.
        let currentStyle = { ...styles.submitButton };
        
        const isDisabled = selectedCode === '' || !selectedCode || isPageLoading;

        if (isActive && !isDisabled) {
            currentStyle = { ...currentStyle, ...styles.submitButtonActive };
        } else if (isHovering && !isDisabled) {
            currentStyle = { ...currentStyle, ...styles.submitButtonHover };
        }
        
        // Now, modifying currentStyle's property is safe because it's a unique object.
        if (isDisabled) {
            currentStyle.opacity = 0.6; 
            currentStyle.cursor = 'not-allowed';
            currentStyle.backgroundColor = PRIMARY_ACCENT;
        }

        return currentStyle;
    };

    return (
        <div style={styles.languageSelector}>
            <div style={styles.titleSection}>
                
                <div 
                    style={{
                        ...styles.loadingOverlay, 
                        ...(isPageLoading ? styles.loadingVisible : {})
                    }}
                >
                    <div className="spinner" style={styles.spinnerStyle} />
                    <p style={styles.loadingText}>Loading Interface...</p>
                </div>
                
                <h1 style={styles.title}>WELCOME TO SIGNSPEAK </h1>
                <p style={styles.subtitle}>“Breaking Barriers, Building Bridges” </p>
                <h4 style={styles.heading}>Select Your Preferred Language:</h4>
                
                <div style={styles.dropdownContainer}>
                    <select
                        style={styles.selectElement}
                        value={selectedCode}
                        onChange={handleSelectChange}
                        disabled={isPageLoading}
                    >
                        {languages.map((lang) => (
                            <option key={lang.code} value={lang.code} disabled={lang.code === ''}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSubmit}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    style={getButtonStyles()}
                    disabled={selectedCode === '' || !selectedCode || isPageLoading}
                >
                    Continue
                </button>
                
            </div>
        </div>
    );
}

export default LanguageSelector;