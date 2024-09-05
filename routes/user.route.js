const express = require("express");
const { createUser, loginUser, profileEdit, verifyOTPUser } = require('../controller/user.controller');
const { authenticate } = require('../middlewares/authenticate');
const currentLogin = require('../middlewares/currentLogin'); // Ensure this matches the actual file name

const app = express.Router();

app.get('/currentUser', currentLogin);
app.post('/signUp', createUser);
app.post('/login', loginUser);
app.post("/verifyOtp", verifyOTPUser);
app.post('/edit/:id', authenticate, profileEdit);

module.exports = app;
