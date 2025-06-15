import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { YouTubeLearningPortal } from './components/YtInput/YouTubeInputCard';
import { MainLanding } from './components/Landing/Main-Landing';
import { MainQuiz } from './components/Knowledge-Check/MainQuiz';
import { MainResources } from './components/Resources/MainResources';
import { CodePlayground } from './components/CodeDojo/Codeplayground';
import { CompetitiveArena } from './components/CP/CompetitiveArena';
import { Signup } from './components/Auth/Signup';
import { Login } from './components/Auth/Login';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TheoryContent } from './components/Content/TheoryContent';
// import { Layout } from 'lucide-react';
import {Layout } from './components/Linear/Test/Layout'
import { Pcm } from './components/PCM';
// import { Stem } from './components/STEM';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLanding />} />
          <Route path="/input" element={<YouTubeLearningPortal />} />
          <Route path="/content" element={ <TheoryContent /> } />
          <Route path="/code" element={<CodePlayground />} />
          <Route path="/cp" element={<CompetitiveArena />} />
          <Route path="/kc" element={<MainQuiz />} />
          <Route path="/rh" element={<MainResources />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pcm" element={<Pcm />} />
          <Route path="/stem" element={<Layout />} />
          
          <Route path="/Test" element={<Layout />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
};

export default App;