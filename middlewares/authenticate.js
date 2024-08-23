// /middleware/authenticate.js

const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");

const authenticate = (req, res, next) => {
  const authHeader = req.header("Authorization");
	// if token is not send, 
  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, message: "Access denied. No token provided." });
  }
	// Token is normally send as Bearer (token), replace the Bearer and only store
	// the token value
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // send the user data payload in req.user
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid token." });
  }
};

const authAdmin =  (permissions)=>{
  return async(req,res,next)=>{
    try{
      const roles = await User.find(role)
      console.log(roles);
        if(permissions.includes(roles)){
          next()
        }else{
            res.status(401).json({success:false,message:"You don't have permssion in this route"})
        }
    }catch(err){
      res.status(400).json({ success: false, message: err });
    }
  }
}

module.exports = authenticate,authAdmin;
