import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import StudySpotList from './components/StudySpotList';
import AddStudySpot from './components/AddStudySpot';
import UserRegistration from './components/UserRegistration';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<StudySpotList />} />
            <Route path="/add-spot" element={<AddStudySpot />} />
            <Route path="/register" element={<UserRegistration />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
