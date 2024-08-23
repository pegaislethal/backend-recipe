// validations/recipesValidation-zod.js

const { z } = require("zod");
const recipeSchema = z.object({
  recipeTitle: z
    .string()
    .min(5, { message: "Recipe title must be at least 5 characters long" })
    .max(100, { message: "Recipe title must be at most 100 characters long" }),
  recipeDesc: z
    .string()
    .min(10, {
      message: "Recipe description must be at least 10 characters long",
    })
    .max(500, {
      message: "Recipe description must be at most 500 characters long",
    }),
  preparationTime: z
    .number()
    .positive({ message: "Preparation time must be a positive number" }),
  Calorie: z
    .number()
    .positive({ message: "Calorie must be a positive number" }),
  Ingredients: z.array(
    z
      .string()
      .min(1, { message: "Ingredient must be at least 1 character long" })
      .max(100, { message: "Ingredient must be at most 100 characters long" })
  ),
  Directions: z.array(
    z
      .string()
      .min(5, { message: "Direction must be at least 5 characters long" })
      .max(300, { message: "Direction must be at most 300 characters long" })
  ),
});

const validateRecipe = (req, res, next) => {
  try {
    recipeSchema.parse(req.body);
    next();
  } catch (e) {
    res.status(400).json({ error: e.errors });
  }
};

module.exports = validateRecipe;
