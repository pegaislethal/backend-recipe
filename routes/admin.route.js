const express = require("express");
const { createAdmin, loginAdmin, verifyOTPAdmin ,adminPage} = require('../controller/admin.controller')
const authAdmin = require('../middlewares/authenticate')


const app = express.Router();

app.get('/',authAdmin,adminPage)
app.post('/signUp',createAdmin);
app.post('/login',loginAdmin)
app.post("/verifyOtp",verifyOTPAdmin );
module.exports = app;