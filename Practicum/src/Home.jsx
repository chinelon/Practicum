// import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {

  const handleButtonClick = async () => {

    try {
      const response = await axios.post('https://practicum-7pxf.onrender.com/trap/bot');
      console.log('Response from server:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="home">
      <div id="navbar">
        <Link to="/login">Login</Link>
      </div>

      <h1>Welcome to the Trinity Hospital</h1>
      <p>Where all patients are valued and cared for.</p>

      <button
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        onClick={handleButtonClick}
        tabIndex={-1}
        aria-hidden="true"
      >
        Click Me
      </button>

      <button>
        <Link to="/admin">Admin logon</Link>
      </button>
    </div>
  );
}

export default Home;
