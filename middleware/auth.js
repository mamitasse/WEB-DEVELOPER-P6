const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {

    const token = req.headers.authorization.split(" ")[1];
console.log(token);
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET"); // chaîne à changer en production
    const userId = decodedToken.userId;
    
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};