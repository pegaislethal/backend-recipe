const express = require("express");
const {createUser,loginUser,verifyOTPUser,profileEdit} = require('../controller/user.controller');
const {authenticate} = require('../middlewares/authenticate')

const app = express.Router();

app.post('/signUp',createUser);
app.post('/login',loginUser)
app.post("/verifyOtp",verifyOTPUser );
app.post('/edit/:id',authenticate, profileEdit)

module.exports = app;