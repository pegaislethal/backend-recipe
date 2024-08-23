const mongoose = require("mongoose");
const recipeSchema = new mongoose.Schema(
  {
    recipeTitle: {
      type: String,
      required: true,
    },
    recipeDesc: {
      type: String,
      required: true,
    },
    preparationTime: {
      type: Number,
      required: true,
    },
    Calorie: {
      type: Number,
      required: true,
    },
    Ingredients: [
      {
        type: String,
        required: true,
      },
    ],
    Directions: [
      {
        type: String,
        required: true,
      },
    ],
    Category: {
        type:[String]

    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("recipes", recipeSchema);
