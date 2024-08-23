require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db.connection");
const mainRouter = require("./routes/index.route");
const app = express();
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", mainRouter);



const PORT = process.env.PORT || 7777;
app.listen(PORT, () => console.log(`Server Running on PORT: http://localhost:${PORT}`));
