import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {

  mongoose.connection.on('connected', () => {
    console.log('Data base coonected');
  });
  await mongoose.connect(`${process.env.MONGODB_URI}/sign_login_auth` )
}



export default connectDB;