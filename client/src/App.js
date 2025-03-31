import { useEffect, useState } from "react";
import { fetchUsers, createUser, fetchUserById, updateUser, deleteUser } from "./api.js";
import "./App.css";
import React from "react";

function App() {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [zip, setZip] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchUsers()
            .then((data) => setUsers(data))
            .catch((err) => console.error("Error fetching users:", err));
    }, []);

    const resetForm = () => {
        setName("");
        setZip("");
        setUserDetails(null);
        setIsEditing(false);
    };

    // Handle form submission to create a new user or update an existing user
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!/^\d{5}$/.test(zip)) {
            alert("Please enter a valid 5-digit ZIP code.");
            return;
        }

        try {
            if (isEditing && userDetails) {

                
                // Update the user if we are in editing mode
                const updatedUser = await updateUser(userDetails.id, name, zip);

                setUsers(prevUsers => prevUsers.map(user =>
                    user.id === updatedUser.id ? updatedUser : user
                ));
                setUserDetails(updatedUser); 

            } else {

                // Create a new user
                const newUser = await createUser(name, zip);
                setUsers(prevUsers => [...prevUsers, newUser]);
            }

            // Clear the form fields after submitting
            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error("Error processing request:", error);
            alert("An error occurred. Please try again.");
        }
    };

    // get rid of this?? 
    const handleViewUser = async (userId) => {
        setLoading(true);
        setIsEditing(false);
        resetForm();
        try {
            const user = await fetchUserById(userId);
            setUserDetails(user);
            setError(null);
        } catch (err) {
            setError("Error fetching user details. Please try again.");
            setUserDetails(null);
        } finally {
            setLoading(false);
        }
    };

    // Set the form state to edit the selected user
    const handleEditUser = () => {
        if (userDetails) {
            setName(userDetails.name);
            setZip(userDetails.zip);
            setIsEditing(true);
        }
    };

    // Cancel editing and go back to "View Details" mode
    const handleCancel = () => {
        resetForm();
        setShowForm(false);
    };

    // Delete a user by ID
    const handleDeleteUser = async (userId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
        if (confirmDelete) {
            try {
                await deleteUser(userId);
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

                // If the deleted user was being viewed or edited, clear the fields
                if (userDetails && userDetails.id === userId) {
                    setUserDetails(null);
                    resetForm();
                    setIsEditing(false);
                }
            } catch (error) {
                console.error("Error deleting user:", error);

                if (error.response) {
                    console.error("Response Data:", error.response.data);
                    console.error("Response Status:", error.response.status);
                    console.error("Response Headers:", error.response.headers);
                } else if (error.request) {
                    console.error("No response received:", error.request);
                } else {
                    console.error("Error message:", error.message);
                }
                alert("An error occurred while deleting the user.");
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.zip.includes(searchTerm)
    );

    return (
        <div className="container">

            <nav className="navbar">
                <input
                    type="text"
                    placeholder="Search by name or ZIP"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </nav>


            <h1>RentRedi User Management System</h1>

            {!showForm && (
                <button className="button" onClick={() => setShowForm(true)}>
                    Add New User
                </button>
            )}
            {showForm && (
                <form onSubmit={handleSubmit} className="user-form">
                    <input
                        className="input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        required
                    />
                    <input
                        className="input"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="Zip Code"
                        required
                    />
                    <button className="button" type="submit">
                        {isEditing ? "Update User" : "Add User"}
                    </button>
                    <button className="button" type="button" onClick={() => { resetForm(); setShowForm(false); }}>
                        Cancel
                    </button>
                </form>
            )}

            <ul className="user-list">
                {filteredUsers.map((user) => (
                    <li key={user.id} className="user-item">
                        {user.name} ({user.zip})
                        <div className="button-container">

                            <button onClick={() => handleViewUser(user.id)}>View Details</button>
                            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                        </div>

                    </li>
                ))}
            </ul>

            {loading && <div>Loading user details...</div>}
            {error && <div>{error}</div>}

            {userDetails && !loading && (
                <div className="user-details">
                    <h2>User Details</h2>
                    {isEditing ? (
                        
                        <>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Name"
                                required
                            />
                            <input
                                value={zip}
                                onChange={(e) => setZip(e.target.value)}
                                placeholder="Zip Code"
                                required
                            />
                            <div className="button-container">
                                <button
                                    className="button save-button"
                                    onClick={handleSubmit}
                                    disabled={!name || !zip || (userDetails && userDetails.name === name && userDetails.zip === zip)}
                                >
                                    Save Changes
                                </button>
                                <button className="button cancel-button" onClick={handleCancel}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p><strong>ID:</strong> {userDetails.id}</p>
                            <p><strong>Name:</strong> {userDetails.name}</p>
                            <p><strong>Zip:</strong> {userDetails.zip}</p>
                            <p><strong>Latitude:</strong> {userDetails.latitude}</p>
                            <p><strong>Longitude:</strong> {userDetails.longitude}</p>
                            <p><strong>Timezone:</strong> {userDetails.timezone}</p>
                            <div className="button-container">
                                <button className="button" onClick={handleEditUser}>
                                    Edit
                                </button>
                                <button className="button cancel-button" onClick={handleCancel}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;


