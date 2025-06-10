//import { useState } from 'react'
import './App.css'
import Home from './Home'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
// import Signup from './Signup'; // Assuming you have a Signup component
function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/signup" element={<Signup />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
