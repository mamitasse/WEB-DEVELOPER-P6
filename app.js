const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path =require('path');

const app = express();

const mongoose = require('mongoose');
const sauceRoutes = require("./routes/sauces");
const userRoutes = require("./routes/user");

app.use(express.json());
app.use(cors());
const dotenv = require("dotenv");
dotenv.config();


mongoose.connect(process.env.DB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));



app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;