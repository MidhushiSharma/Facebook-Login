const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");

const router = express();

router.set('view engine', 'ejs');
router.use(express.static("public"));
router.use(bodyParser.urlencoded({ extended: true }));
router.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: "my first Authentication"
}));
router.use(passport.initialize());
router.use(passport.session());
const userModel = require("./users");

const data = new userModel()

passport.use(new localStrategy(userModel.authenticate()));

passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());
router.get("/", function (req, res) {
  res.render("index");
});

router.post("/reg", function (req, res) {
  const dets = new userModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  userModel.register(dets, req.body.password).then(function (registeredUser) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.get("/profile",isLoggedIn ,function (req, res) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(user){
    res.render('profile',{user});
  })
});


router.get("/login", function (req, res) {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res) {
  req.logOut();
  res.redirect("/");
});



function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}
router.listen(8000, function(){
  console.log("Server started on the port 8000");
});

module.exports = router;
