const mongoose = require("mongoose");

const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return (
          Joi.number().integer().min(1).max(10).validate(value).error === null
        );
      },
      message: "Le heat doit être un entier compris entre 1 et 10.",
    },
  },
  likes: { type: Number, required: true },
  dislikes: { type: Number, required: true },
  usersLiked: [String],
  usersdisLiked: [String],
});

module.exports = mongoose.model("sauce", sauceSchema);
