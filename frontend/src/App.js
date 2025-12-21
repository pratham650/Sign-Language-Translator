import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import UploadForm from './components/UploadForm';
import WebcamCapture from './components/WebcamCapture';
import ChoicePage from "./components/ChoicePage";
import LanguageSelector from './components/LanguageSelector';

function App() {
  const [language, setLanguage] = useState(null);

  // Step 1: Show language selector before anything else
  if (!language) {
    return <LanguageSelector onSelectLanguage={setLanguage} />;
  }

  return (
    <div className="App container mt-5">
      <h1 className="text-center mb-4">
        {language === 'hi' ? 'साइनस्पीक - सांकेतिक भाषा अनुवादक' : 'SignSpeak - Sign Language Translator'}
      </h1>

      <ChoicePage language={language} />
    </div>
  );
}

export default App;
