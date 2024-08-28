const express = require("express");
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  filterRecipes
} = require("../controller/recipe-add.controller");
const upload = require('../middlewares/multer');

const {authenticate,authAdmin} = require('../middlewares/authenticate');
const validateRecipe = require('../validations/recipesValidation-zod');
const app = express.Router();

app.post('/', authenticate, authAdmin('admin'), upload.single('Image'), createRecipe);
app.get('/', authenticate, getRecipes);  // Accessible by authenticated users
app.get('/filter', authenticate, filterRecipes);  // Accessible by authenticated users
app.get('/:id', authenticate, getRecipeById);
app.patch('/:id', authenticate, authAdmin('admin'), upload.single('Image') ,updateRecipe);
app.delete('/:id', authenticate, authAdmin('admin'), deleteRecipe);

module.exports = app;
