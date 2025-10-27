import userModel from '../models/usermodel.js';


export const getUserData =async (req, res)=>{
  try{
    const {userId} = req.body;
    const user = await userModel.findById(userId);

    if(!user){
      res.json({success:false, mwssage:'User Not found'})
    }
    res.json({success:true,
       userData:{
        name:user.name,
        isVerified: user.isVerified
       }
    })

  }catch(error){
    res.json({success:false, mwssage:error.mwssage})
  }
}