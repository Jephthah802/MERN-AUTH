import express from 'express'
import userauth from '../midlrwre/userauth.js';
import { getUserData } from '../controllers/userControler.js';

const userRouther = express.Router();

userRouther.get('/data',userauth,getUserData)

export default userRouther;