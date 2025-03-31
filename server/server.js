import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';

const app = express(); 

app.use(cors({ origin: 'http://localhost:3000' })); 
app.use(express.json()); 

import userRoutes from './routes/userRoutes.js'; 

app.use('/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
                 
export default app;