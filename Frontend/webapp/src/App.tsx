import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { EventDetail } from './pages/EventDetail';
import { Bookings } from './pages/Bookings';
import { LoginPage, SignupPage } from './pages/login';
import { GoogleCallback } from './pages/GoogleCallback';
import { AIChat } from './components/AIChat';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
        </Routes>
      </Layout>
      <AIChat />
    </Router>
  );
};

export default App;

