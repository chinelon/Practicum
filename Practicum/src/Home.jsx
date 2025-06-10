import {Link} from 'react-router-dom';

function Home() {
  return (
    <div className="home">
        <Link to="/login">
            <button>Login</button>
        </Link>
        <Link to="/signup">
            <button>Sign up</button>
        </Link>
      <h1>Welcome to the Home Page</h1>
      <p>This is the main page of our application.</p>
    </div>
  );
}
export default Home;