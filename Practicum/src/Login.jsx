import { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = (event) => {
    event.preventDefault();
    // Here you would typically handle the login logic, e.g., sending a request to your server
    console.log('Email:', email);
    console.log('Password:', password);
  }
  return (
    <div className="login">
      <h1>Login Page</h1>
      <p>Please enter your credentials to log in.</p>
      <div className='login-container'>
        <Link to="/">Back to Home</Link>
        <form onSubmit={handleLogin}>
          <div className='form-columns'>
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              placeholder="johndoe@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className='form-columns'>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>

    </div>
  );
}
export default Login;