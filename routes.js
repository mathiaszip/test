import express from 'express';
const router = express.Router();
import connectDB from './db.js';
import UserProfile from './models/userInfo.js';
import crypto from 'crypto';

import { checkSession, generateSessionToken } from './myFunctions';


const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  router.post('/importUser', async (req, res) => {
    try {
      const db = await connectDB();
      const users = db.collection('users');
      // Check if email or username already exists            
      const existingUser = await users.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
      if (existingUser) {
        res.json({ error: 'Username or email already exists' }); // Error message
      } else {
        const userProfile = new UserProfile({ // Requesting the information from the form
          username: req.body.username,
          password: crypto.createHash('sha256').update(req.body.password).digest('hex'), // Requests the password from the frontend and encrypts it using the security standard AES256-bit encryption method.
          email: req.body.email,
          birthday: req.body.birthday,
        });
  
        const newUser = await users.insertOne(userProfile); // Insert the data into the database
        res.json({ success: true });
      }
    } catch (error) {
      console.log("Error importing user:", error);
      res.json({ error: 'Unknown error' });
    }
  });

  router.post('/api/login', async (req, res) => {
    try {
        const db = await connectDB();
        const userDetails = {
            username: req.body.username,
            password: crypto.createHash('sha256').update(req.body.password).digest('hex'),
        }
        const user = await db.collection('users').findOne({ username: userDetails.username, password: userDetails.password });
        if (!user) {
            res.status(401).json({ error: 'Invalid username or password' });
        } else {
            // Create a session for the user
            const sessionToken = generateSessionToken();
            const sessionExpiration = new Date(Date.now() + SESSION_DURATION)
            await db.collection('sessions').insertOne({ sessionToken, userId: user._id, expires: sessionExpiration }) ;
            // Set a cookie with the session token and redirect the user to the dashboard
            res.cookie('session', sessionToken, { expires: sessionExpiration, httpOnly: true});
            res.redirect('/dashboard');
        }
    } catch (error) {
        console.log("Error logging in:", error);
        res.json({ error: 'Unknown error' });
      }

})

  

export default router;