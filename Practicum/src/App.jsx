//import { useState } from 'react'
import './App.css'
import Home from './Home'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import AllUsers from './AllUsers';
import PageNotFound from './PageNotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/allusers" element={<AllUsers />} />
        <Route path="/404" element={<PageNotFound />} />
        {/* Redirect any unknown routes to Home */}
      </Routes>
    </Router>
  );
}

export default App;
