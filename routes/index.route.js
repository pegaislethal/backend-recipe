const express =require('express');

const recipeRoutes = require('./recipe.route')
const currentLogin  = require('../middlewares/currentLogin')
const userRoutes = require('./user.route');
const adminRoutes = require('./admin.route');
const { verifyOTP } = require('../controller/user.controller');

const app = express.Router();


app.use('/users',userRoutes);
app.get('/current',currentLogin)
app.post('/verifyOtp',verifyOTP)
app.use('/recipes',recipeRoutes)
app.use('/admin',adminRoutes)

module.exports = app;