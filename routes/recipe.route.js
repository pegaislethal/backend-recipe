const express = require("express");
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  filterRecipes,
  postReview
} = require("../controller/recipe-add.controller");
const upload = require('../middlewares/multer');

const {authenticate,authAdmin} = require('../middlewares/authenticate');
// const validateRecipe = require('../validations/recipesValidation-zod');
const app = express.Router();

app.post('/', authenticate, authAdmin('admin'), upload.single('Image'), createRecipe);
app.get('/', getRecipes);  // Accessible by authenticated users
app.get('/filter', authenticate, filterRecipes);  // Accessible by authenticated users
app.get('/:id', getRecipeById);
app.patch('/:id', authenticate, authAdmin('admin'), upload.single('Image') ,updateRecipe);
app.delete('/:id', authenticate, authAdmin('admin'), deleteRecipe);
app.post('/reviews/:id',authenticate,postReview);


module.exports = app;
