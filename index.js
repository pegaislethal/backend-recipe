require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Import CORS package
const connectDB = require("./config/db.connection");
const mainRouter = require("./routes/index.route");
const app = express();

connectDB();


app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // Allows cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", mainRouter);

const PORT = process.env.PORT || 7777;
app.listen(PORT, () => console.log(`Server Running on PORT: http://localhost:${PORT}`));
