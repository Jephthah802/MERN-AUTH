import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import connectDB from './config/mongodb.js';
import authRouter from './routes/authrout.js';
import userRouther from './routes/userrouts.js';

const app = express();

app.use(
  cors({
    origin: [
      'https://mern-auth-4hv0owu6a-jephewoh-gmailcoms-projects.vercel.app',
      'https://mern-auth-xezq.onrender.com',
      'https://mern-auth-peach-pi.vercel.app',
      'http://localhost:5173',
      'http://127.0.0.1:5500',
    ],
    credentials: true,
  })
);


app.use(express.json());
app.use(cookieParser());

connectDB();

// API Endpoints
app.get('/', (req, res) => {
  res.send('API is running...');
});
app.use('/api/auth', authRouter);
app.use('/api/user', userRouther);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});