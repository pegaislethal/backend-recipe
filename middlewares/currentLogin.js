const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes');


const currentUser = async function verifyToken(req, res, next) {
    let token = req.headers["authorization"];
  
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Token not provided" });
    }
  
    token = token.substring(7); // Remove "Bearer " from token
  
    try {
      const data = jwt.verify(token, process.env.JWT_SECRET);
      // console.log("Decoded token data:", data);
      res.status(201).json({success: true, data: data})
  
  
      next();
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred" });
    }
  };
  
module.exports = currentUser 