const express = require("express");
const Recipe = require("../model/recipeSchema"); // Use singular 'Recipe' for the model
const Review = require("../model/reviewSchema");
const { uploadOnCloudinary } = require("../utils/cloudinary.util"); // Cloudinary upload service
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
    Chef,
    Calorie,
    Reviews,
    Ingredients,
    Directions,
    Category,
    Image,
  } = req.body;

  try {
    let imageUrl = "";

    // Check if there's a file to upload
    if (req.file) {
      const uploadResponse = await uploadOnCloudinary(req.file.path);
      // console.log(uploadResponse)
      // console.log(req.file.path);
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
      reviews: req.user.reviews,
      Chef: req.user.username,
      Ingredients,
      Directions,
      Category,
      Image: imageUrl,
    });
    console.log(newRecipe);
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
        Image: imageUrl,
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
  const { id: recipeId } = req.params; // Correct extraction of recipeId from params
  const { rating, reviewText } = req.body;
  const userId = req.user.id; // Assuming you have user authentication

  // Validate rating
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    // Check if the user has already reviewed this recipe
    // const existingReview = await Review.findOne({ recipeId, userId });
    // if (existingReview) {
    //   return res
    //     .status(400)
    //     .json({ message: "You have already reviewed this recipe" });
    // }

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
    ).populate("reviews");

    res
      .status(201)
      .json({ message: "Review added successfully", updatedRecipe });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error posting review", error: error.message });
  }
};

const getReviews = async (req, res) => {
  const { id } = req.params; // Get the recipeId from the request parameter
  try {
    const recipe = await Recipe.findById(id).populate("reviews"); // Populate reviews
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    // Send back the reviews
    res.status(200).json(recipe.reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching reviews", error });
  }
};

const deleteReviews = async (req, res) => {
  const { id } = req.params; // Get the review ID from request parameters
  try {
    const deletedReview = await Review.findByIdAndDelete(id); // Delete the review by ID
    if (deletedReview) {
      res.status(200).json({ message: "Review deleted successfully", deletedReview });
    } else {
      res.status(404).json({ message: "Review not found" }); // Review not found
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error }); // Handle any server errors
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
  getReviews,
  deleteReviews
};
