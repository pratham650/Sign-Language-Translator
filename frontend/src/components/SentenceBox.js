import React, { useState, useCallback, memo, useEffect } from 'react';
import axios from 'axios';

// --- SentenceBox Component (Styled with Tailwind CSS) ---
const SentenceBox = memo(({ sentence, onClear, onBackspace }) => {
    // TTS function for Read button
    const handleRead = (text) => {
        if ('speechSynthesis' in window) {
            const synth = window.speechSynthesis;
            synth.cancel();
            
            // FIX: Remove spaces for natural word reading (e.g., "A P P L E" -> "APPLE")
            const textToRead = text.trim().replace(/\s+/g, '');
            
            const utterThis = new SpeechSynthesisUtterance(textToRead);
            utterThis.rate = 0.9; // Normal speed
            utterThis.pitch = 1; // Normal pitch
            utterThis.lang = 'en-US'; 
            
            if (utterThis.text.length > 0) {
                synth.speak(utterThis);
            }
        } else {
            console.error("Text-to-Speech not supported.");
        }
    };

    return (
        <div className="mt-8 p-4 bg-gray-50 rounded-xl shadow-inner border border-gray-200 animate-fadeIn">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                📝 Current Sentence
            </h3>
            
            {/* Sentence Display Area - Styled like a Tailwind alert/display box */}
            <div className="p-4 mb-4 bg-white border border-indigo-200 rounded-lg min-h-[4rem] flex items-center shadow-sm">
                <p className="font-medium text-gray-800 break-words text-lg">
                    {sentence || <span className="text-gray-400 italic">No sentence formed yet.</span>}
                </p>
            </div>

            {/* Buttons - Improved Layout and Visibility */}
            {sentence && (
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {/* Clear Button */}
                    <button
                        className="flex-1 min-w-[10rem] px-4 py-3 text-sm font-extrabold text-white bg-red-600 rounded-xl shadow-lg hover:bg-red-700 transition duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                        onClick={onClear}
                        disabled={!sentence}
                    >
                        🧹 Clear Sentence
                    </button>
                    
                    {/* Backspace Button */}
                    <button
                        className="flex-1 min-w-[10rem] px-4 py-3 text-sm font-extrabold text-gray-800 bg-yellow-400 rounded-xl shadow-lg hover:bg-yellow-500 transition duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                        onClick={onBackspace}
                        disabled={!sentence}
                    >
                        ⌫ Backspace
                    </button>
                    
                    {/* Speak Button */}
                    <button
                        className="flex-1 min-w-[10rem] px-4 py-3 text-sm font-extrabold text-white bg-green-600 rounded-xl shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                        onClick={() => handleRead(sentence)}
                        disabled={!sentence.trim()}
                    >
                        🔊 Speak
                    </button>
                </div>
            )}
        </div>
    );
});


// --- Main UploadForm Component ---
function UploadForm({ goBack }) {
    const [sentence, setSentence] = useState('');
    const [image, setImage] = useState(null);
    const [prediction, setPrediction] = useState(''); // Used briefly for display/speech
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); 
    const [sentenceFade, setSentenceFade] = useState(false); 

    // Set up speech synthesis functions
    // This is used for reading the individual sign as it's added.
    const speak = useCallback((text) => {
        if ('speechSynthesis' in window) {
            const synth = window.speechSynthesis;
            synth.cancel();
            const utterThis = new SpeechSynthesisUtterance(text);
            utterThis.rate = 0.9;
            synth.speak(utterThis);
        }
    }, []);

    // Function to handle prediction and automatic addition
    const predictAndAddSign = useCallback(async (file) => {
        if (!file) return;

        setError(''); 
        setLoading(true);
        setPrediction('');

        const formData = new FormData();
        formData.append('file', file);
        
        let result = '';

        try {
            // NOTE: This assumes a local server is running on port 5000 for the ML model.
            // This part is for demonstration only, as the backend is external.
            const res = await axios.post('http://localhost:5000/predict', formData);
            result = res.data.prediction;
            
        } catch(err) {
            console.error('Prediction failed:', err);
            // Mock result if connection fails, just for UI demonstration purposes
            result = file.name.toUpperCase().charAt(0);
            setError('Prediction API connection failed. Showing mock result based on filename.');
        }
        
        // --- THIS IS THE AUTOMATIC SENTENCE BUILDING FEATURE ---
        // We append the new sign/letter with a space for visual clarity.
        setSentence((prev) => (prev ? `${prev} ${result}` : result));
        // --------------------------------------------------------
        
        // 2. Set prediction for temporary display
        setPrediction(result); 
        
        // 3. Trigger fade animation
        setSentenceFade(true); 
        setTimeout(() => setSentenceFade(false), 500); 

        // 4. Speak the new sign (e.g., says "A")
        speak(result);
        
        setLoading(false);
    }, [speak]); // Depend on 'speak'

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Set the image state
            setImage(file);
            // Immediately trigger the prediction and addition process (The automatic feature)
            predictAndAddSign(file);
        }
        // Crucial: Clear the input value so the same file can be uploaded again
        e.target.value = '';
    };

    const clearSentence = () => {
        setSentence('');
        setPrediction('');
        setError('');
        setImage(null);
        window.speechSynthesis.cancel(); // Stop speech when clearing
    };

    const handleBackspace = () => {
        // This removes the last letter/sign and its preceding space
        setSentence((prev) => prev.trim().split(' ').slice(0, -1).join(' '));
        window.speechSynthesis.cancel(); // Stop speech when backspacing
    };
        
    // Combined CSS and styles (Kept the exact same visual styling)
    const combinedStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

        /* Global Base Styles */
        .app-container {
            min-height: 100vh;
            font-family: 'Inter', sans-serif !important;
            background: linear-gradient(to bottom right, #e0f2fe, #bfdbfe) !important; 
            /* Increased vertical padding */
            padding: 4rem 1rem;
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }

        /* Main Card Styling */
        .main-card {
            background-color: #ffffff;
            border-radius: 1.5rem; /* rounded-2xl */
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-2xl / shadow-xl boost */
            /* Increased padding inside the card */
            padding: 2.5rem; 
            transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
            max-width: 450px;
            width: 100%;
            margin-top: 1rem; /* Slightly reduced top margin as padding is increased */
        }

        /* Prediction Result/Success Box */
        .prediction-box-success {
            border-left: 6px solid #10b981; /* border-green-500 */
            background-color: #ecfdf5; /* bg-green-50 */
            color: #065f46; /* text-green-700 */
            border-radius: 0.75rem;
            padding: 1.5rem; /* Increased inner padding */
            margin-top: 2rem; /* Increased top margin for separation */
        }
        /* Prediction Error Box */
        .prediction-error-box {
            border-left: 6px solid #ef4444; /* border-red-500 */
            background-color: #fef2f2; /* bg-red-50 */
            color: #991b1b; /* text-red-700 */
            border-radius: 0.75rem;
            padding: 1.5rem; /* Increased inner padding */
            margin-top: 2rem; /* Increased top margin for separation */
        }

        /* Button Base Styles and Interactivity */
        .btn-base {
            padding: 0.75rem 1.5rem;
            font-weight: 700;
            border-radius: 0.75rem; /* rounded-xl */
            transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        /* Hover/Focus effect (used on multiple buttons) */
        .btn-hover:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
        }

        /* Predict Button (No longer used directly, but styles kept for consistency) */
        .btn-primary-predict {
            background-color: #4f46e5; /* bg-indigo-600 */
            color: #ffffff;
            border: none;
        }
        .btn-primary-predict:disabled {
            background-color: #9ca3af; /* bg-gray-400 */
            transform: none;
            box-shadow: none;
            cursor: not-allowed;
        }

        /* Add to Sentence Button (No longer used directly, but styles kept for consistency) */
        .btn-secondary-add {
            background-color: #059669; /* bg-emerald-600 */
            color: #ffffff;
            padding: 0.6rem 1rem; /* Slightly increased padding */
            border-radius: 0.75rem;
            font-size: 0.9rem; 
            font-weight: 700;
            transition: background-color 0.2s, transform 0.2s;
            box-shadow: 0 2px 4px rgba(5, 150, 105, 0.3);
        }
        .btn-secondary-add:hover {
            background-color: #047857;
            transform: scale(1.02);
        }

        /* Back Button */
        .btn-secondary-back {
            background-color: #ffffff;
            color: #4b5563; /* text-gray-600 */
            border: 2px solid #e5e7eb; /* border-gray-200 */
        }
        .btn-secondary-back:hover {
            background-color: #f9fafb; 
            border-color: #d1d5db; 
            transform: scale(1.01);
        }

        /* File Input Styling */
        .file-input-container {
            display: flex;
            align-items: center;
            background-color: #f3f4f6; /* bg-gray-100 */
            border-radius: 0.75rem;
            padding: 0.6rem; /* Increased padding */
            border: 2px solid transparent;
            transition: border-color 0.3s ease;
        }
        .file-input-container:focus-within {
            border-color: #6366f1; /* indigo-500 */
        }
        .file-input-label {
            background-color: #6366f1; /* indigo-500 */
            color: white;
            padding: 0.6rem 1.25rem; /* Increased padding */
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .file-input-label:hover {
            background-color: #4f46e5; /* indigo-600 */
        }
        .file-input-text {
            padding-left: 1rem; /* Increased left padding */
            color: #4b5563; /* text-gray-600 */
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex-grow: 1;
        }
        /* Hide the actual file input element */
        .hidden-file-input {
            display: none;
        }

        /* Custom Animations (kept the same) */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { 
            animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        .loading-btn { 
            animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes slideIn { 
            from { transform: translateX(-10px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .sentence-update {
            animation: slideIn 0.5s ease-out;
        }
    `;
    
    // Display name for the selected file
    const fileName = image ? image.name : 'No file chosen';

    return (
        <div className="app-container">
            
            {/* Inject ALL CSS styles here */}
            <style>{combinedStyles}</style>
            
            <div className="main-card">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-10 text-center tracking-tight">Sign Language Translator</h1>

                <div className="mt-4 space-y-6">
                    <div className="space-y-2">
                        <label className="block text-base font-medium text-gray-700">
                            Upload Sign Image:
                        </label>
                        <div className="file-input-container">
                            {/* The label acts as the visible button */}
                            <label htmlFor="file-upload" className={`file-input-label ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                {loading ? 'Processing...' : 'Choose File'}
                            </label>
                            {/* The hidden input is where the magic happens */}
                            <input
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                                className="hidden-file-input"
                                accept="image/*"
                                disabled={loading}
                                // We rely on clearing the e.target.value in handleFileChange
                            />
                            <span className="file-input-text">
                                {fileName}
                            </span>
                        </div>
                    </div>
                    
                    {loading && (
                        <div className="w-full text-center py-3">
                            <p className="text-indigo-600 font-semibold text-lg loading-btn">
                                Predicting and Adding Sign...
                            </p>
                        </div>
                    )}
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="prediction-error-box fade-in">
                        <p className="font-semibold">{error}</p>
                    </div>
                )}

                {/* Prediction Result Display (Short transient display) */}
                {prediction && !error && (
                    <div className="prediction-box-success fade-in flex flex-col items-center">
                        <p className="font-bold text-base text-gray-700 tracking-wide mb-2">
                            Predicted Added to Sentence:
                        </p> 
                        <p className="font-extrabold text-5xl text-indigo-700">
                            "{prediction}"
                        </p>
                    </div>
                )}

                {/* Sentence Box */}
                <div className={sentenceFade ? 'sentence-update' : ''}>
                    <SentenceBox
                        sentence={sentence}
                        onClear={clearSentence}
                        onBackspace={handleBackspace}
                    />
                </div>
            
                {/* Back Button */}
                <button
                    onClick={goBack}
                    className="w-full btn-base btn-secondary-back mt-8 btn-hover"
                    type="button"
                >
                    ⬅ Back to Home
                </button>
            </div>
        </div>
    );
}

export default UploadForm;