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

  useEffect(() => {
    axios
      .get('https://practicum-7pxf.onrender.com/')
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          setIsBlocked(true);
        }
      });
  }, []);

  const handleButtonClick = async () => {
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
  };

  return (
    <div className="home">
      <div id="navbar">
        <Link to="/login" style={{ pointerEvents: isBlocked ? 'none' : 'auto', opacity: isBlocked ? 0.5 : 1 }}>
          Login
        </Link>
        <Link to="/signup" style={{ pointerEvents: isBlocked ? 'none' : 'auto', opacity: isBlocked ? 0.5 : 1 }}>
          Sign up
        </Link>
      </div>

      <h1>Welcome to the Trinity Hospital</h1>
      <p>Where all patients are valued and cared for.</p>

      <button onClick={handleButtonClick} disabled={isBlocked}>
        Click Me
      </button>
      <button onClick={handleButtonHumanClick} disabled={isBlocked}>
        <Link to="/404" style={{ pointerEvents: isBlocked ? 'none' : 'auto', opacity: isBlocked ? 0.5 : 1 }}>
          Admin
        </Link>
      </button>

      {isBlocked && (
        <p style={{ color: 'red' }}>
          🚫 Your IP has been blocked due to suspicious activity.
        </p>
      )}
    </div>
  );
}

export default Home;
