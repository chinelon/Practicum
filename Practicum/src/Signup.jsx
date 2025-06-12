import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
    const navigate = useNavigate()
    const [name, setName] = useState('');
    const [phoneno, setPhoneno] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signupError, setSignupError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const handleSignup = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/signup', {
                name,
                phoneno,
                address,
                email,
                password
            });

            console.log('User created:', response.data);
            setSuccessMessage('Account created successfully!');
            setSignupError(null);

            navigate('/allusers');

        } catch (error) {
            console.error('Signup error:', error);
            setSuccessMessage(null);
            if (error.response && error.response.status === 500) {
                setSignupError('A user with this email may already exist or there was a server error.');
            } else {
                setSignupError('Failed to create user. Please try again.');
            }
        }
    };

    return (
        <div className="signup-container">
            <Link to="/">Back to Home</Link>
            <h2>Create a user here!</h2>
            <p>Please fill in the details to create an account.</p>

            <form onSubmit={handleSignup}>
                <div className="form-columns">
                    <div>
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="phoneno">Phone No:</label>
                        <input
                            type="text"
                            placeholder="08993467882"
                            value={phoneno}
                            onChange={(e) => setPhoneno(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="address">Address:</label>
                        <input
                            type="text"
                            placeholder="21, Halle berry drive, New York"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            placeholder="johndoe@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            placeholder="*****"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit">Sign Up</button>
                </div>
            </form>

            {signupError && <p style={{ color: 'red' }}>{signupError}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </div>
    );
}

export default Signup;
