import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  
  const handleButtonClick = async () => {
    try {
      const response = await axios.post('https://practicum-7pxf.onrender.com/trap/bot')
    
      console.log('Response from server:', response.data);
    } catch (error) {
      console.error('Error fetching data from server:', error);
    }
  };
  const handleButtonHumanClick = async () => {
    try {
      const response = await axios.post('https://practicum-7pxf.onrender.com/trap/human')

      console.log('Response from server:', response.data);
    } catch (error) {
      console.error('Error fetching data from server:', error);
    }
  };
  return (
    <div className="home">
      <div id="navbar">
        <Link to="/login">Login </Link>

        <Link to="/signup">Sign up</Link>
      </div>

      <h1>Welcome to the Trinity Hospital</h1>
      <p>Where all patients are valued and cared for.</p>
      <button onClick={handleButtonClick}>Click Me</button>
      <button onClick={handleButtonHumanClick}><Link to="/404">Admin</Link></button>
    </div>
  );
}
export default Home;