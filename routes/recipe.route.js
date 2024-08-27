const express = require("express");
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  filterRecipes
} = require("../controller/recipe-add.controller");

const {authenticate,authAdmin} = require('../middlewares/authenticate');
const validateRecipe = require('../validations/recipesValidation-zod');
const app = express.Router();

app.post('/', authenticate, authAdmin('admin'), validateRecipe, createRecipe);
app.get('/', authenticate, getRecipes);  // Accessible by authenticated users
app.get('/filter', authenticate, filterRecipes);  // Accessible by authenticated users
app.get('/:id', authenticate, getRecipeById);
app.patch('/:id', authenticate, authAdmin('admin'), updateRecipe);
app.delete('/:id', authenticate, authAdmin('admin'), deleteRecipe);

module.exports = app;
