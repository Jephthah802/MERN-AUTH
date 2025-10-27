import express from 'express';
import { isAuthenticated, login, logout,register, resetPassword, sendResetOtp, sendverifyOtp, verifyEmail } from '../controllers/authController.js';
import userauth from '../midlrwre/userauth.js';

const  authRouter = express.Router();


authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',userauth,sendverifyOtp);
authRouter.post('/verify-account',userauth,verifyEmail);
authRouter.get('/is-auth',userauth,isAuthenticated);
authRouter.post('/send-reset-otp',sendResetOtp);
authRouter.post('/reset-password',resetPassword);



export default authRouter;