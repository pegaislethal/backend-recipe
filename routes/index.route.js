const express =require('express');

const recipeRoutes = require('./recipe.route')
const userRoutes = require('./user.route');
const adminRoutes = require('./admin.route')
const app = express.Router();


app.use('/users',userRoutes);
app.use('/recipes',recipeRoutes)
app.use('/admin',adminRoutes)

module.exports = app;