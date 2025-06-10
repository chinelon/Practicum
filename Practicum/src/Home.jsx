import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home">
      <div id="navbar">
        <Link to="/login">Login </Link>

        <Link to="/signup">Sign up</Link>
      </div>

      <h1>Welcome to the Trinity Hospital</h1>
      <p>Where all patients are valued and cared for.</p>
    </div>
  );
}
export default Home;