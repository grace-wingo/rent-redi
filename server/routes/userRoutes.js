import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import db from "../config/firebase.js";
import { Router } from 'express';
const router = Router();
// const request = require("supertest");


const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

// Create User
router.post("/", async (req, res) => {
  console.log('hey')
  console.log("Received request with body:", req.body);
  const { name, zip } = req.body;

  try {

    // Ensure required fields are present
    if (!name || !zip) {
      return res.status(400).json({ error: "Name and ZIP code are required." });
    }

    // Validate ZIP code format
    if (!/^\d{5}$/.test(zip)) {
      return res.status(400).json({ error: "Please enter a valid 5-digit ZIP code." });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},US&appid=${API_KEY}`;
    const response = await axios.get(url);

    const { lat, lon } = response.data.coord;
    const timezone = response.data.timezone;

    // Save user to Firebase
    const newUserRef = db.ref("users").push();
    const userId = newUserRef.key;

    await newUserRef.set({
      id: userId,
      name,
      zip,
      latitude: lat,
      longitude: lon,
      timezone,
    });

    res.status(201).json({ id: userId, name, zip, latitude: lat, longitude: lon, timezone });
  } catch (error) {
    console.log(error)
    console.error("Error creating user:", error.response?.data || error.message);

    if (error.response && error.response.status === 404) {
      console.log('in here')
      return res.status(404).json({ error: `City not found for ZIP code: ${zip}` });
    }

    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all users from Firebase.');

    const usersRef = db.ref('users');

    const snapshot = await usersRef.once('value');

    if (!snapshot.exists()) {
      return res.status(200).json([]);
    }

    const users = [];
    snapshot.forEach(childSnapshot => {
      const user = childSnapshot.val();
      user.id = childSnapshot.key;
      users.push(user);
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Something went wrong while fetching users.' });
  }
});

// Get a single user by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id; 


    console.log(`Fetching user with ID: ${userId} from Firebase.`);

    // Reference to the specific user in Firebase by their ID
    const userRef = db.ref('users').child(userId);

    // Get the user data from Firebase
    const snapshot = await userRef.once('value');

    // If no user is found, return a 404 with a message
    if (!snapshot.exists()) {
      return res.status(404).json({ message: "User not found" });
    }

    // Retrieve the user data
    const user = snapshot.val();
    // Add the Firebase key as the user ID
    user.id = snapshot.key;  

    res.json(user);  
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: error.message });
  }
});


// Update a single user by ID
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, zip } = req.body;

    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (zip && !zipRegex.test(zip)) {
      return res.status(400).json({ message: "Invalid ZIP code format" });
    }

    const userRef = db.ref('users').child(userId);
    const snapshot = await userRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = snapshot.val();
    let newLatitude = currentUser.latitude;
    let newLongitude = currentUser.longitude;
    let newTimezone = currentUser.timezone;
    console.log('currentUser', currentUser)

    if (zip !== currentUser.zip) {
      // Fetch new location data from the weather API
      const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},US&appid=${API_KEY}`;
      const response = await axios.get(url);
      console.log(response)

      const { lat, lon } = response.data.coord;
      const timezone = response.data.timezone;

      // Update new values for latitude, longitude, and timezone
      newLatitude = lat;
      newLongitude = lon;
      newTimezone = timezone;
    }

    // Update user data in Firebase
    await userRef.update({
      name: name || currentUser.name,
      zip: zip || currentUser.zip,
      latitude: newLatitude,
      longitude: newLongitude,
      timezone: newTimezone,
    });

    res.json({
      id: userId,
      name: name || currentUser.name,
      zip: zip || currentUser.zip,
      latitude: newLatitude,
      longitude: newLongitude,
      timezone: newTimezone,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a user by ID
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`Deleting user with ID: ${userId} from Firebase.`);

    // Reference to the specific user in Firebase by their ID
    const userRef = db.ref('users').child(userId);

    // Delete the user data from Firebase
    await userRef.remove();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
