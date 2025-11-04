import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import StudySpotList from './components/StudySpotList';
import AddStudySpot from './components/AddStudySpot';
import UserRegistration from './components/UserRegistration';
import UserLogin from './components/UserLogin';
import StudySpotDetailsPage from './components/StudySpotDetailsPage';

function App() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} setUser={setUser} />
        <main>
          <Routes>
            <Route path="/" element={<StudySpotList />} />
            <Route path="/add-spot" element={<AddStudySpot />} />
            <Route path="/register" element={<UserRegistration />} />
            <Route path="/studyspots/:id" element={<StudySpotDetailsPage />} />
            <Route path="/login" element={<UserLogin setUser={setUser} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
