// import { Link } from 'react-router-dom';
// import axios from 'axios';

// function Home() {
  
//   const handleButtonClick = async () => {
//     try {
//       const response = await axios.post('https://practicum-7pxf.onrender.com/trap/bot')
    
//       console.log('Response from server:', response.data);
//     } catch (error) {
//       console.error('Error fetching data from server:', error);
//     }
//   };
//   const handleButtonHumanClick = async () => {
//     try {
//       const response = await axios.post('https://practicum-7pxf.onrender.com/trap/human')

//       console.log('Response from server:', response.data);
//     } catch (error) {
//       console.error('Error fetching data from server:', error);
//     }
//   };
//   return (
//     <div className="home">
//       <div id="navbar">
//         <Link to="/login">Login </Link>

//         <Link to="/signup">Sign up</Link>
//       </div>

//       <h1>Welcome to the Trinity Hospital</h1>
//       <p>Where all patients are valued and cared for.</p>
//       <button onClick={handleButtonClick}>Click Me</button>
//       <button onClick={handleButtonHumanClick}><Link to="/404">Admin</Link></button>
//     </div>
//   );
// }
// export default Home;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [lockdown, setLockdown] = useState(false);

  useEffect(() => {
    const wasLocked = localStorage.getItem('lockdown');
    if (wasLocked === 'true') {
      setLockdown(true);
      setShowPopup(true);
      return;
    }

    axios.get('https://practicum-7pxf.onrender.com/')
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          setLockdown(true);
          setShowPopup(true);
          setIsBlocked(true);
          localStorage.setItem('lockdown', 'true');
        }
      });
  }, []);

  const handleButtonClick = async () => {
    if (lockdown) return;

    try {
      const response = await axios.post('https://practicum-7pxf.onrender.com/trap/bot');
      console.log('Response from server:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleButtonHumanClick = async () => {
    try {
      const response = await axios.post('https://practicum-7pxf.onrender.com/trap/human');
      console.log('Response from server:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }

    // Lock UI immediately
    setLockdown(true);
    setShowPopup(true);
    localStorage.setItem('lockdown', 'true');
  };

  return (
    <div className="home" style={lockdown ? { pointerEvents: 'none', opacity: 0.4 } : {}}>
      <div id="navbar">
        <Link to="/login" onClick={(e) => lockdown && e.preventDefault()}>Login</Link>
        <Link to="/signup" onClick={(e) => lockdown && e.preventDefault()}>Sign up</Link>
      </div>

      <h1>Welcome to the Trinity Hospital</h1>
      <p>Where all patients are valued and cared for.</p>

      <button onClick={handleButtonClick} disabled={lockdown}>Click Me</button>
      <button onClick={handleButtonHumanClick} disabled={lockdown}>Admin</button>

      {showPopup && (
        <div style={popupStyle}>
          <div style={modalContentStyle}>
            <h2>Access Denied</h2>
            <p>Your IP has been blocked due to suspicious activity. Please contact itsupport@trinity.com for assistance.</p>
          </div>
        </div>
      )}
    </div>
  );
}

const popupStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '10px',
  textAlign: 'center',
  maxWidth: '400px',
  boxShadow: '0 0 20px rgba(0,0,0,0.3)',
};

export default Home;
