import React, { useState } from 'react';
import { Link } from 'react-router-dom';
function Signup() {
    const [name, setName] = useState('');
    const [phoneno, setPhoneno] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleSignup = (event) => {
        event.preventDefault();
        // Here you would typically handle the login logic, e.g., sending a request to your server
        console.log('Email:', email);
        console.log('Password:', password);
    }
    return (
        <div className="signup-container">
            <Link to="/">Back to Home</Link>
            <h2>Create a user here!</h2>
            <p>Please fill in the details to create an account.</p>
            <form onSubmit={handleSignup} >
                <div className='form-columns'>
                    <div>
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        /> </div>

                    <div>
                        <label htmlFor="phoneno">Phone No:</label>
                        <input
                            type="text"
                            placeholder="08993467882"
                            value={phoneno}
                            onChange={(e) => setPhoneno(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="address">Address:</label>
                        <input
                            type="text"
                            placeholder="21, Halle berry drive, New York"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="text"
                            placeholder="johndoe@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            placeholder="*****"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit">Sign Up</button>
                </div>

            </form>
        </div>
    );
}
export default Signup;
