import React, { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// --- 1. SentenceBox Component (Defined inline for single-file mandate) ---
const SentenceBox = React.memo(({ sentence, onClear, onBackspace }) => {
    return (
        <div className="w-full max-w-xs p-4 bg-white rounded-lg shadow-inner mt-4">
            <h2 className="text-sm font-semibold text-gray-600 mb-2">Current Sentence:</h2>
            <p className="text-xl font-medium text-gray-900 break-words min-h-10 border-b pb-2">
                {sentence || <span className="text-gray-400 italic">Start signing...</span>}
            </p>
            <div className="flex justify-between mt-3">
                <button
                    className="flex-1 mr-2 px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition"
                    onClick={onClear}
                    disabled={!sentence}
                >
                    Clear All
                </button>
                <button
                    className="flex-1 px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                    onClick={onBackspace}
                    disabled={!sentence}
                >
                    ⌫ Backspace
                </button>
            </div>
        </div>
    );
});


// --- 2. Prediction Buffer Class ---
class PredictionBuffer {
    constructor(size = 10) {
        this.size = size;
        this.buffer = [];
    }

    add(prediction) {
        this.buffer.push(prediction);
        if (this.buffer.length > this.size) {
            this.buffer.shift();
        }
    }

    getMajority() {
        if (this.buffer.length < this.size * 0.5) return null;

        const counts = {};
        let maxCount = 0;
        let majority = null;

        for (const pred of this.buffer) {
            counts[pred] = (counts[pred] || 0) + 1;
            if (counts[pred] > maxCount) {
                maxCount = counts[pred];
                majority = pred;
            }
        }
        
        // Return majority only if it appears at least 50% of the time
        if (maxCount >= Math.ceil(this.size * 0.5)) {
            return majority;
        }
        return null;
    }
}


const predictionBuffer = new PredictionBuffer(10);
const VIDEO_WIDTH = 320;
const VIDEO_HEIGHT = 240;


// --- 3. Main Component ---
function WebcamCapture({ goBack }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null); 
    
    const [prediction, setPrediction] = useState('');
    const [sentence, setSentence] = useState('');
    const [isCapturing, setIsCapturing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const lastAddedChar = useRef('');
    const predictionIntervalRef = useRef(null);

    // --- Configuration ---
    const CONFIDENCE_THRESHOLD = 0.85;
    const PREDICTION_INTERVAL_MS = 200;
    const SPACE_SIGN = 'S'; 
    const DELETE_SIGN = 'D';
    // ---------------------

    const speak = useCallback((text) => {
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance(text);
        if (text && text.length > 1) {
            synth.speak(utterThis);
        }
    }, []);

    const clearSentence = useCallback(() => {
        setSentence('');
    }, []);

    const handleBackspace = useCallback(() => {
        setSentence((prev) => prev.slice(0, -1)); 
    }, []);
    
    const getLastWord = (currentSentence) => {
        const words = currentSentence.trim().split(' ');
        return words.length > 0 ? words[words.length - 1] : '';
    };
    
    // --- Video Stream Initialization ---
    const startVideoStream = useCallback(async () => {
        if (videoRef.current) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT, facingMode: "user" } 
                });
                videoRef.current.srcObject = stream;
            } catch (err) {
                console.error("Error accessing webcam:", err);
                // In a real app, display a user-friendly error message here
            }
        }
    }, []);

    const processPrediction = useCallback((result, confidence) => {
        // State update using functional update for `sentence` dependency
        setSentence(currentSentence => {
            predictionBuffer.add(result);
            const stablePrediction = predictionBuffer.getMajority();
            setPrediction(result); 

            if (stablePrediction && confidence >= CONFIDENCE_THRESHOLD) {
                
                if (stablePrediction !== lastAddedChar.current) {

                    if (stablePrediction === SPACE_SIGN) {
                        if (currentSentence.slice(-1) !== ' ' && currentSentence.trim().length > 0) {
                            
                            const completedWord = getLastWord(currentSentence);
                            if (completedWord) {
                                speak(completedWord);
                            }
                            
                            lastAddedChar.current = stablePrediction;
                            return currentSentence + ' '; 
                        }
                        
                    } else if (stablePrediction === DELETE_SIGN) {
                        handleBackspace();
                        lastAddedChar.current = stablePrediction;
                        return currentSentence.slice(0, -1); 
                        
                    } else {
                        if (currentSentence.slice(-1) !== stablePrediction) {
                            lastAddedChar.current = stablePrediction;
                            return currentSentence + stablePrediction; 
                        }
                    }
                }
            }
            return currentSentence; 
        });
    }, [speak, handleBackspace]);


    const captureAndPredict = useCallback(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.readyState !== 4) return;

        // Draw video frame to canvas for image extraction
        const context = canvas.getContext('2d');
        // Apply horizontal flip for proper image orientation on the backend
        context.translate(VIDEO_WIDTH, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        
        // Get Base64 image data
        const imageSrc = canvas.toDataURL('image/jpeg');

        if (loading) return; 
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/predict-webcam', {
                image: imageSrc
            });
            const { prediction: result, confidence } = res.data;
            
            processPrediction(result, confidence); 

        } catch (error) {
            console.error('Webcam prediction failed:', error);
        } finally {
            setLoading(false);
        }
    }, [loading, processPrediction]);

    // --- EFFECT HOOK TO MANAGE THE CONTINUOUS LOOP AND VIDEO STREAM ---
    useEffect(() => {
        // Start video stream when component mounts
        startVideoStream();

        // **FIX for ESLint Warning:** Copy the ref value inside the effect scope
        const currentVideoRef = videoRef.current; 
        
        if (isCapturing) {
            predictionIntervalRef.current = setInterval(captureAndPredict, PREDICTION_INTERVAL_MS);
        } else {
            clearInterval(predictionIntervalRef.current);
            predictionIntervalRef.current = null;
        }

        // Cleanup function
        return () => {
            clearInterval(predictionIntervalRef.current);
            // Use the copied variable in the cleanup function
            if (currentVideoRef && currentVideoRef.srcObject) { 
                currentVideoRef.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    // Removed startVideoStream from dependency array as it's stable and only needs to run once.
    }, [isCapturing, captureAndPredict]); 


    const toggleCapture = () => {
        setIsCapturing(prev => !prev);
        predictionBuffer.buffer = []; 
        lastAddedChar.current = '';
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 min-h-screen">
            <style>
                {`
                /* Tailwind styles for the component */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .text-shadow { text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
                `}
            </style>
            <h1 className="text-3xl font-bold mb-6 text-indigo-700 text-shadow">Live ASL Translation</h1>
            
            <div className="bg-white p-6 rounded-xl shadow-2xl mb-6 border-4 border-indigo-400">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    width={VIDEO_WIDTH}
                    height={VIDEO_HEIGHT}
                    className="rounded-lg border-2 border-indigo-100" 
                    // No need for transform scale-x-[-1] here, as the canvas handles the flip for the backend image
                    onLoadedMetadata={(e) => e.target.play()}
                />
                {/* Canvas is required to convert the video frame into a Base64 image for the backend */}
                <canvas 
                    ref={canvasRef} 
                    width={VIDEO_WIDTH} 
                    height={VIDEO_HEIGHT} 
                    style={{ display: 'none' }}
                />
            </div>
            
            <div className="w-full max-w-xs space-y-3">
                <button 
                    className={`w-full font-semibold py-3 rounded-lg shadow-md transition duration-200 
                                ${isCapturing ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                    onClick={toggleCapture}
                    disabled={loading && isCapturing}
                >
                    {isCapturing ? '🛑 Stop Translation' : '▶️ Start Live Translation'}
                </button>

                {/* Display the unstable (raw) prediction */}
                <div className="text-lg font-mono text-center h-8">
                    {isCapturing && (loading ? 
                        <span className="text-indigo-500 animate-pulse">Processing...</span> : 
                        <span className="text-gray-700">Raw: {prediction}</span>)}
                </div>
            </div>

            <SentenceBox
                sentence={sentence}
                onClear={clearSentence}
                onBackspace={handleBackspace}
            />

            <button
                onClick={goBack}
                className="mt-6 text-sm text-indigo-600 hover:text-indigo-800 transition duration-150 py-2 px-4 rounded-md border border-indigo-200"
                type="button"
            >
                ⬅️ Back to Home
            </button>
        </div>
    );
}

export default WebcamCapture;