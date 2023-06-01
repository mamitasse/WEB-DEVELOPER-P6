const fs = require("fs");
const Sauce = require("../models/sauce");



exports.createSauce = (req, res) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce ({
      ...sauceObject,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: [],
      imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
      .then(() => {res.status(201).json({message: 'Sauce enregistrée !'})})
      .catch(error => res.status(400).json({error}))
};


exports.getAllSauces = (req, res) => {
  Sauce.find()
      .then(response => res.status(200).json(response))
      .catch(error => res.status(404).json({error}))
};

exports.getOneSauce = (req, res) => {
  Sauce.findOne({_id: req.params.id})
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({error}))
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
           Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.updateSauce = (req, res) => {
  let sauceObject = {};
  req.file ? (
      Sauce.findOne({_id: req.params.id})
          .then(sauce => {
              if(req.auth.userId !== sauce.userId){
                  res.status(403).json({message: `Non autorisé !`})
              } else {
                  const filename = sauce.imageUrl.split("/").at(-1);
                  fs.unlinkSync(`images/${filename}`)
              }
          }),
      sauceObject = {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
          }
      ) : sauceObject = {...req.body};
  Sauce.updateOne({_id: req.params.id},{...sauceObject, _id: req.params.id})
      .then(() => res.status(200).json({message: 'Sauce modifiée !'}))
      .catch((error) => res.status(400).json({error}))
};


exports.deleteSauce = (req, res) => {
  Sauce.findOne({_id: req.params.id})
      .then(sauce => {
          if(req.auth.userId !== sauce.userId){
              res.status(403).json({message: `Non autorisé !`})
          } else{
              const filename = sauce.imageUrl.split("/").at(-1);
              fs.unlink(`images/${filename}`, () => {
                  Sauce.deleteOne({ _id: req.params.id })
                      .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
                      .catch((error) => res.status(400).json({ error }));
              });  
          }
      })
  .catch((error) => res.status(500).json({ error }));
};
// Permet de "liker"ou "dislaker" une sauce

exports.likeDislike = (req, res, next) => {
  // Pour la route READ = Ajout/suppression d'un like / dislike à une sauce
  // Like présent dans le body
  let like = req.body.like
  // On prend le userID
  let userId = req.body.userId
  // On prend l'id de la sauce
  let sauceId = req.params.id

  if (like === 1) { // Si il s'agit d'un like
    Sauce.updateOne({
        _id: sauceId
      }, {
        // On push l'utilisateur et on incrémente le compteur de 1
        $push: {
          usersLiked: userId
        },
        $inc: {
          likes: +1
        }, // On incrémente de 1
      })
      .then(() => res.status(200).json({
        message: 'j\'aime ajouté !'
      }))
      .catch((error) => res.status(400).json({
        error
      }))
  }
  if (like === -1) {
    Sauce.updateOne( // S'il s'agit d'un dislike
        {
          _id: sauceId
        }, {
          $push: {
            usersDisliked: userId
          },
          $inc: {
            dislikes: +1
          }, // On incrémente de 1
        }
      )
      .then(() => {
        res.status(200).json({
          message: 'Dislike ajouté !'
        })
      })
      .catch((error) => res.status(400).json({
        error
      }))
  }
  if (like === 0) { // Si il s'agit d'annuler un like ou un dislike
    Sauce.findOne({
        _id: sauceId
      })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) { // Si il s'agit d'annuler un like
          Sauce.updateOne({
              _id: sauceId
            }, {
              $pull: {
                usersLiked: userId
              },
              $inc: {
                likes: -1
              }, // On incrémente de -1
            })
            .then(() => res.status(200).json({
              message: 'Like retiré !'
            }))
            .catch((error) => res.status(400).json({
              error
            }))
        }
        if (sauce.usersDisliked.includes(userId)) { // Si il s'agit d'annuler un dislike
          Sauce.updateOne({
              _id: sauceId
            }, {
              $pull: {
                usersDisliked: userId
              },
              $inc: {
                dislikes: -1
              }, // On incrémente de -1
            })
            .then(() => res.status(200).json({
              message: 'Dislike retiré !'
            }))
            .catch((error) => res.status(400).json({
              error
            }))
        }
      })
      .catch((error) => res.status(404).json({
        error
      }))
  }
}