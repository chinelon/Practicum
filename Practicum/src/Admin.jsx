import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Admin() {
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://practicum-7pxf.onrender.com/trap/human', {
                data
            });
            const data = response.data;
            console.log('Admin login successful:', data);
            navigate('/404');

        } catch (error) {
            console.error('Error during admin login:', error);
            alert('Admin login failed. Please try again.');
            setData('');
        }
    }
    return (
        <div className="login">
            <h1>Admin Login</h1>
            <p>Please enter your credentials.</p>
            <div className="login-container">
                <Link to="/"> Back to Home</Link>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="*****"
                        value={data}
                        onChange={(e) => setData(e.target.value)} />
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default Admin;