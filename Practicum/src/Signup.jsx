import React, { useState } from 'react';
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
        <div className="signup">
            <h1>Signup Page</h1>
            <p>Please fill in the details to create an account.</p>
            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="08993467882"
                    value={phoneno}
                    onChange={(e) => setPhoneno(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="21, Halle berry drive, New York"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="johndoe@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="*****"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}
export default Signup;
