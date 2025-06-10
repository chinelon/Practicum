import { useState } from 'react';


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
      
      <form onSubmit={handleLogin}>
        <input 
          type="text" 
          placeholder="johndoe@gmail.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
export default Login;