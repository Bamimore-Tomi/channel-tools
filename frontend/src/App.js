// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Custom context
import { AuthProvider } from './components/Auth/AuthContext';

// Components
import Navbar from './components/UI/Navbar';
import Footer from './components/UI/Footer';

// Pages
import HomePage from './pages/HomePage';
import ChannelsPage from './pages/ChannelsPage';
import ChannelDetailPage from './pages/ChannelDetailPage';
import AuthPage from './pages/AuthPage';
import SearchPage from './pages/SearchPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <Container className="flex-grow-1 py-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/channels" element={<ChannelsPage />} />
              <Route path="/channels/:channelId" element={<ChannelDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/users/:userId" element={<UserProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Container>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;