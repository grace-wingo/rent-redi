import admin from 'firebase-admin';

// Initialize Firebase with service account credentials
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rent-redi-936a8-default-rtdb.firebaseio.com/",
});

const db = admin.database();

export default db;

