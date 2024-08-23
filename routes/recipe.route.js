const express = require("express");
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  filterRecipes
} = require("../controller/recipe-add.controller");

const  authenticate   = require('../middlewares/authenticate');
const authAdmin =require('../middlewares/authenticate');
const validateRecipe = require('../validations/recipesValidation-zod');
const app = express.Router();



app.post('/', validateRecipe, authAdmin, createRecipe);
app.get('/', authenticate, getRecipes);
app.get('/filter',authenticate, filterRecipes);
app.get('/:id', authenticate, getRecipeById);
app.patch('/:id', authAdmin, updateRecipe);
app.delete('/:id', authAdmin, deleteRecipe);

module.exports = app;
