const express = require("express");
const Recipe = require("../model/recipeSchema"); // Use singular 'Recipe' for the model
const Review = require("../model/reviewSchema");
const { uploadOnCloundinary } = require("../utils/cloudinary.util"); // Cloudinary upload service
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json());

const createRecipe = async (req, res) => {
  const image = req.file;
  const {
    recipeTitle,
    recipeDesc,
    preparationTime,
    Calorie,
    Ingredients,
    Directions,
    Category,
  } = req.body;

  // console.log(recipeTitle);

  try {
    let imageUrl = "";

    // Check if there's a file to upload
    if (req.file) {
      const uploadResponse = await uploadOnCloundinary(req.file.path);
      console.log(req.file.path);
      if (uploadResponse) {
        imageUrl = uploadResponse.url;
        // Delete the locally saved file after uploading to Cloudinary
        // fs.unlinkSync(req.file.path);
      } else {
        return res
          .status(500)
          .json({ message: "Failed to upload image to Cloudinary." });
      }
    }

    const newRecipe = new Recipe({
      recipeTitle,
      recipeDesc,
      preparationTime,
      Calorie,
      Chef: req.user.username,
      Ingredients,
      Directions,
      Category,
      Image: imageUrl, // Save the Cloudinary image URL in the database
    });

    await newRecipe.save();
    res.status(201).json({ message: "Recipe added successfully", newRecipe });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding recipe", error });
  }
};

const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find(); // Use 'Recipe' model correctly
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recipes", error });
  }
};

// Get a recipe by ID
const getRecipeById = async (req, res) => {
  const { id } = req.params;
  try {
    const recipe = await Recipe.findById(id).populate("reviews");
    if (recipe) {
      res.status(200).json(recipe);
    } else {
      res.status(404).json({ message: "Recipe not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching recipe", error });
  }
};

// Update a recipe
const updateRecipe = async (req, res) => {
  const { id } = req.params;
  const {
    recipeTitle,
    recipeDesc,
    preparationTime,
    Calorie,
    Chef,
    Ingredients,
    Directions,
    Category,
  } = req.body;

  try {
    let imageUrl = "";

    // Check if there's a new image to upload
    if (req.file) {
      const uploadResponse = await uploadCloudinary(req.file.path);
      if (uploadResponse) {
        imageUrl = uploadResponse.url;
        // Delete the locally saved file after uploading to Cloudinary
        fs.unlinkSync(req.file.path);
      } else {
        return res
          .status(500)
          .json({ message: "Failed to upload image to Cloudinary." });
      }
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      {
        recipeTitle,
        recipeDesc,
        preparationTime,
        Calorie,
        Chef,
        Ingredients,
        Directions,
        Category,
        image: imageUrl || undefined,
      },
      { new: true }
    );
    if (updatedRecipe) {
      res
        .status(200)
        .json({ message: "Recipe updated successfully", updatedRecipe });
    } else {
      res.status(404).json({ message: "Recipe not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating recipe", error });
  }
};

// Delete a recipe
const deleteRecipe = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(id); // Use 'Recipe' model correctly
    if (deletedRecipe) {
      res
        .status(200)
        .json({ message: "Recipe deleted successfully", deletedRecipe });
    } else {
      res.status(404).json({ message: "Recipe not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting recipe", error });
  }
};

const filterRecipes = async (req, res) => {
  try {
    let { Category } = req.query;

    // If Category is a string, convert it to an array
    if (typeof Category === "string") {
      Category = Category.split(",");
    }

    // Ensure Category is an array, even if a single Category is passed
    if (!Array.isArray(Category)) {
      Category = [Category];
    }

    // Convert all category values to lowercase
    Category = Category.map((cat) => cat.toLowerCase());

    // MongoDB query for case-insensitive search
    const recipes = await Recipe.find({
      Category: {
        $in: Category.map((cat) => new RegExp("^" + cat + "$", "i")),
      },
    });

    if (recipes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No recipes found for these categories",
      });
    }

    res
      .status(200)
      .json({ success: true, recipes, totalRecipes: recipes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const postReview = async (req, res) => {
  const { recipeId, rating, reviewText } = req.body;
  const userId = req.user.id; // Assuming req.user contains the authenticated user's info

  try {
    // Create a new review
    const newReview = new Review({
      recipeId,
      userId,
      rating,
      reviewText,
    });

    await newReview.save();

    // Add the review to the associated recipe
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $push: { reviews: newReview._id } },
      { new: true }
    ).populate("reviews"); // Populate the reviews

    res
      .status(201)
      .json({ message: "Review added successfully", updatedRecipe });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error posting review", error });
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  filterRecipes,
  postReview,
};
