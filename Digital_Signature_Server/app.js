const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql2");
const cors = require("cors");
const rateLimiter = require("./middlewares/rateLimiterMiddleware");
require("dotenv").config();
const globalErrorHandler = require("./controllers/errorController");
const corsOptions=require(path.join(__dirname,'config','corsOptions'));
const app = express();
const port = process.env.PORT;
app.use(express.static(path.join(__dirname, "public")));
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(rateLimiter);


// Importing Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const emailRoutes = require("./routes/emailRoutes");

// Using Routes
app.use(authRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use(emailRoutes);

app.use(globalErrorHandler);

app.listen(port, "localhost", () => console.log("listening on port " + port));
