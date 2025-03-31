import axios from "axios";

const API_URL = "/users";

export const createUser = async (name, zip) => {
    const response = await axios.post(API_URL, { name, zip });
    return response.data;
};

export const fetchUsers = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};


export const fetchUserById = async (userId) => {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
};

export const updateUser = async (userId, name, zip) => {
    const response = await axios.put(`${API_URL}/${userId}`, { name, zip });
    return response.data;
};

export const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(`${API_URL}/${userId}`);
        return response.data; 
    } catch (error) {
        console.error("Error deleting user:", error.response?.data || error.message);
        throw new Error("Failed to delete user");
    }
};