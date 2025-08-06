import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);

  const handleLogin = async (e) => {
  e.preventDefault(); // Prevent page reload

  try {
    const response = await axios.post('https://practicum-7pxf.onrender.com/login', {
      email,
      password,
    });

    const { user, token } = response.data;

    if (token) {
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); 

      setUser(user);
      setLoginError(null);
      console.log('Login successful:', response.data);

      if (user.email === 'triadmin@trinity.gmail') {
        navigate('/allusers');
      } else {
        navigate('/other');
      }
    } else {
      setLoginError('Login failed: No token received');
    }

  } catch (error) {
    if (error.response && error.response.status === 401) {
      setLoginError('Invalid email or password');
    } else {
      setLoginError('Something went wrong. Please try again.');
    }
    console.error('Login error:', error);
  }
};


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
          {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
        </form>
      </div>

    </div>
  );
}

export default Login;
