import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Zones from './pages/Zones';
import AudioLibrary from './pages/AudioLibrary';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={<Layout><ProtectedRoute><Dashboard /></ProtectedRoute></Layout>} />
                    <Route path="/zones" element={<Layout><ProtectedRoute><Zones /></ProtectedRoute></Layout>} />
                    <Route path="/audio" element={<Layout><ProtectedRoute><AudioLibrary /></ProtectedRoute></Layout>} />
                    <Route path="/notifications" element={<Layout><ProtectedRoute><Notifications /></ProtectedRoute></Layout>} />
                    <Route path="/admin" element={<Layout><ProtectedRoute adminOnly><Admin /></ProtectedRoute></Layout>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
