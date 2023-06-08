const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

const mongoose = require('mongoose');
const sauceRoutes = require("./routes/sauces");
const userRoutes = require("./routes/user");

app.use(express.json());
app.use(cors());


mongoose.connect('mongodb+srv://mamitasse:Massi.0310@atlascluster.2qjmjwb.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;