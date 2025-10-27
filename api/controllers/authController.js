import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/usermodel.js';
import transporter from '../config/nodemailer.js';


export const register = async (req, res) => {
  console.log("📩 Register API called!");

  const { name, email, password } = req.body;
  if(!name ||!email || !password){
    return res.json({success:false, message:"Missing Details"});
  }
  try{
    const existing = await userModel.findOne({email})
    if(existing){
      return res.json({success:false, message:"User already exists"});
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new userModel({
      name,
      email,
      password:hashPassword
    });
    await user.save();

    const token = jwt.sign({id: user._id},process.env.JWT_SECRET, {expiresIn:"7d"});
    res.cookie('token', token, {
      httpOnly:true,
      secure:process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict',
      maxAge: 7*24*60*60*1000
    });

    //Sending welcome email
    const maillOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to Sign Login Auth',
      text: `Hello ${name}, Welcome to Sign Login Auth. Your accounthas been created with email id:${email}`
    }
    console.log("Attempting to send email to:", email);

   await transporter.sendMail(maillOptions)
  .then(() => console.log("✅ Email sent successfully!"))
  .catch(error => console.log("❌ Email sending error:", error));
    
    return res.json({success:true});

  }catch(error){
    return res.json({success:false, message:error.message});
  }
}


export const login = async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password){
    return res.json({success:false, message:"Enter email and password"});
  }
  try{
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({success:false, message:"Invalid Email"});
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
      return res.json({success:false, message:"Invalid Password"});
    }

    const token = jwt.sign({id: user._id},process.env.JWT_SECRET, {expiresIn:"7d"});

    res.cookie('token', token, {
      httpOnly:true,
      secure:process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict',
      maxAge: 7*24*60*60*1000
    });

    return res.json({success:true});
  }catch(error){
    return res.json({success:false, message:error.message});
  }
    
};


export const logout = async (req, res) => {
  try{
    res.clearCookie('token',{
      httpOnly:true,
      secure:process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict',
    });
    return res.json({success:true, message:"Logged Out"});
  }catch(error){
    return res.json({success:false, message:error.message});
  }
}

//Send Verification OTP to User's Email
export const sendverifyOtp = async (req, res) => {
  try{
    const {userId} = req.body;
    const user = await userModel.findById(userId);
    if(user.isVerified){
      return res.json({success:false, message:"User is already verified"});
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000))

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24*60*60*1000;
    await user.save();

    const maillOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Verify your email',
      text: `Your OTP is ${otp} Verify your email with this OTP`
    }
    await transporter.sendMail(maillOptions);
    return res.json({success:true, message:"Verification OTP sent"});
  }catch(error){
    return res.json({success:false, message:error.message});
  }
};


export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ success: false, message: "User is already verified" });
    }
    

    if (!user.verifyOtp || user.verifyOtpExpireAt < Date.now()) {
      user.verifyOtp = '';
      user.verifyOtpExpireAt = 0;
      await user.save();
      return res.json({ success: false, message: "OTP expired" });
    }

    if (user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email verified" });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


//Check if user is authenticated
export const isAuthenticated = async (req, res) => {
  try{
    return res.json({success:true});
  }catch(error){
    return res.json({success:false, message:error.message});
  }
}

//Send password reset OTP to user's email
export const sendResetOtp = async (req, res) => {
  const {email} = req.body;
  if(!email){
    return res.json({success:false, message:"Enter email"})
  }
  try{
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({success:false, message:"User not found"});
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000))

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const maillOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP for reseting your password is ${otp} use this OTP to reset your password. this OTP will expire in 15 minutes`
    }
    await transporter.sendMail(maillOptions);

    return res.json({success:true, message:"Reset OTP sent to your email"});
    
  }catch(error){
    return res.json({success:false, message:error.message});
  }
}

//Reset Password
export const resetPassword = async (req, res) => {
  const {email, otp, newpassword} = req.body;
  if (!email || !otp || !newpassword) {
    return res.json({ success: false, message: "Enter email, OTP, and new password" });
  }
  
  try{
    const user= await userModel.findOne({email});
    if(!user){
      return res.json({success:false, message:"User not found"});
    }
    if(user.resetOtp ===''||user.resetOtp !== otp){
      return res.json({success:false, message:"Invalid OTP"});
    }
    if(user.resetOtpExpireAt < Date.now()){
      
      return res.json({success:false,message:'OTP Expired'})
    }
    const hashPassword= await bcrypt.hash(newpassword,10)

    user.password = hashPassword;
    user.resetOtp='';
    user.resetOtpExpireAt=0;

    await user.save();
    return res.json({success:true, message:'Password has been reset successfully'})
  }catch(error){
    return res.json({success:false, message:error.message});
  }
  
}
