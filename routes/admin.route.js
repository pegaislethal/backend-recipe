const express = require("express");
const { createAdmin, loginAdmin ,adminPage} = require('../controller/admin.controller')

const {authAdmin,authenticate} = require('../middlewares/authenticate');



const app = express.Router();

app.get('/',authenticate,authAdmin('admin'),adminPage)

app.post('/signUp',createAdmin);
app.post('/login',loginAdmin)
// app.post("/verifyOtp",verifyOTPAdmin );
module.exports = app;