/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const envConfig = require("simple-env-config");

const env = process.env.NODE_ENV || "dev";

const setupServer = async () => {
  const conf = await envConfig("./config/config.json", env);
  const port = process.env.PORT || conf.port;

  const app = express();
  app.use(logger("dev"));
  app.engine("pug", require("pug").__express);
  app.set("views", __dirname);
  app.use(express.static(path.join(__dirname, "../../public")));

  app.store = session({
    name: "session",
    secret: "grahamcardrules",
    resave: false,
    saveUninitialized: false,
    cookie: { path: "/" },
  });
  app.use(app.store);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Passport setup
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await app.models.User.findById(id);
      done(null, user || null);
    } catch (err) {
      done(err, null);
    }
  });

  passport.use(
    new GitHubStrategy(
      {
        clientID: conf.github.clientID,
        clientSecret: conf.github.clientSecret,
        callbackURL: conf.github.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("GitHub Profile:", profile);

          const email =
            profile.emails?.[0]?.value || `no-email-${profile.id}@placeholder.com`;

          const githubId = profile.id;
          const username = (profile.username || `github_${profile.id}`).toLowerCase();
          const firstName = profile.displayName || profile.username || "GitHub User";

          // Find existing user by GitHub ID
          let user = await app.models.User.findOne({ githubId });

          if (!user) {
            // Find existing user by username (in lowercase)
            user = await app.models.User.findOne({ username });

            if (!user) {
              // Create a new user
              user = new app.models.User({
                githubId,
                username,
                primary_email: email,
                first_name: firstName,
              });
            } else {
              // Update existing user with GitHub ID
              user.githubId = githubId;
              user.primary_email = email;
              user.first_name = firstName;
            }

            await user.save();
          }

          return done(null, user);
        } catch (err) {
          console.error("GitHub Strategy Error:", err);
          return done(err);
        }
      }
    )
  );

  app.use(passport.initialize());
  app.use(passport.session());

  try {
    await mongoose.connect(conf.mongodb);
    console.log(`MongoDB connected: ${conf.mongodb}`);
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }

  app.models = {
    Game: require("./models/game.cjs"),
    Move: require("./models/move.cjs"),
    User: require("./models/user.cjs"),
  };

  require("./api/index.cjs")(app);

  // GitHub authentication routes
  app.get("/v1/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

  app.get(
    "/v1/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/login" }),
    async (req, res) => {
      try {
        if (req.user) {
          req.session.user = req.user;
          res.redirect(`/profile/${req.user.username}`);
        } else {
          res.redirect("/login");
        }
      } catch (err) {
        console.error(err);
        res.redirect("/login");
      }
    }
  );

  // Catch-all route to render the base template with preloaded state
  app.get("*", (req, res) => {
    const user = req.session.user;
    const preloadedState = user
      ? {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        primary_email: user.primary_email,
        city: user.city,
        games: user.games,
      }
      : {};
    res.render("base.pug", { state: JSON.stringify(preloadedState) });
  });

  const server = app.listen(port, () =>
    console.log(`Server listening on: ${server.address().port}`)
  );
};

setupServer();
