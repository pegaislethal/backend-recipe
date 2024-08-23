const express = require('express');
const Recipe = require('../model/recipeSchema'); // Use singular 'Recipe' for the model
const app = express();
app.use(express.json());

const createRecipe = async (req, res) => {
    const { 
        recipeTitle,
        recipeDesc,
        preparationTime,
        Calorie,
        Ingredients,
        Directions,
        Category
    } = req.body;

    try {
        const newRecipe = new Recipe({
            recipeTitle,
            recipeDesc,
            preparationTime,
            Calorie,
            Ingredients,
            Directions,
            Category
        });

        // console.log(newRecipe);
        await newRecipe.save();
        res.status(201).json({ message: "Recipe added successfully", newRecipe });
    } catch (error) {
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
        const recipe = await Recipe.findById(id); 
        if (recipe) {
            res.status(200).json(recipe);
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching recipe", error });
    }
};

// Update a recipe
const updateRecipe = async (req, res) => {
    const { id } = req.params;
    const { recipeTitle, recipeDesc, preparationTime, Calorie, Ingredients, Directions } = req.body;

    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(
            id, 
            { recipeTitle, recipeDesc, preparationTime, Calorie, Ingredients, Directions }, 
            { new: true }
        );
        if (updatedRecipe) {
            res.status(200).json({ message: "Recipe updated successfully", updatedRecipe });
        } else {
            res.status(404).json({ message: 'Recipe not found' });
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
            res.status(200).json({ message: "Recipe deleted successfully", deletedRecipe });
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting recipe", error });
    }
};

const filterRecipes = async (req, res) => {
    try {
        let { Category } = req.query; 
     
        // If Category is a string, convert it to an array
        if (typeof Category === 'string') {
            Category = Category.split(",");
        }

        // Ensure Category is an array, even if a single Category is passed
        if (!Array.isArray(Category)) {
            Category = [Category];
        }

        // Convert all category values to lowercase
        Category = Category.map(cat => cat.toLowerCase());

        // MongoDB query for case-insensitive search
        const recipes = await Recipe.find({
            Category: { $in: Category.map(cat => new RegExp('^' + cat + '$', 'i')) }
        });

        if (recipes.length === 0) {
            return res.status(200).json({ success: true, message: "No recipes found for these categories" });
        }

        res.status(200).json({ success: true, recipes, totalRecipes: recipes.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};







module.exports = {
    createRecipe,
    getRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe,
    filterRecipes
};
