import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  
  const handleButtonClick = async () => {
    try {
      const response = await axios.post('http://localhost:3000/trap/bot')
    
      console.log('Response from server:', response.data);
    } catch (error) {
      console.error('Error fetching data from server:', error);
    }
  };
  const handleButtonHumanClick = async () => {
    try {
      const response = await axios.post('http://localhost:3000/trap/human')

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
      <button onClick={handleButtonHumanClick}>Click Me Human</button>
    </div>
  );
}
export default Home;