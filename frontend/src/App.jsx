import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Zones from './pages/Zones';
import AudioLibrary from './pages/AudioLibrary';
import Notifications from './pages/Notifications';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/zones" element={<Zones />} />
                    <Route path="/audio" element={<AudioLibrary />} />
                    <Route path="/notifications" element={<Notifications />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
