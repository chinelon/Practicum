import React from 'react';

function AllUsers() {
    // Dummy user data
    const users = [
        {
            id: 1,
            name: "John Doe",
            phoneno: "08993467882",
            address: "21, Halle berry drive, New York",
            email: "johndoe@gmail.com",
            userType: "Admin"
        },
        {
            id: 2,
            name: "Jane Smith",
            phoneno: "08123456789",
            address: "10, Apple street, California",
            email: "janesmith@gmail.com",
            userType: "Nurse"
        },
        {
            id: 3,
            name: "Bob Johnson",
            phoneno: "08098765432",
            address: "5, Orange avenue, Texas",
            email: "bobjohnson@gmail.com",
            userType: "Doctor"
        }
    ];

    return (
        <div className="all-users">
            <h1>All Users</h1>
            <p>This page will list all users.</p>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone Number</th>
                        <th>Address</th>
                        <th>Email</th>
                        <th>User Type</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.phoneno}</td>
                            <td>{user.address}</td>
                            <td>{user.email}</td>
                            <td>{user.userType}</td>
                            <td>
                                <button>Edit</button>
                                <button style={{ marginLeft: '10px' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AllUsers;