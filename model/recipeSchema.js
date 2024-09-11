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
      Chef: {
        type: String,
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
      reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        default:0 ,
        ref: 'Reviews' // Reference to the Review model
      }],
      Category: {
        type: [String],
      },
      Image: {
        type: String, 
        default: "",
      },
    },
    { timestamps: true }
  );

  module.exports = mongoose.model("recipes", recipeSchema);
