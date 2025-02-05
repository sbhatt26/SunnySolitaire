/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

const Joi = require("joi");

module.exports = (app) => {
  /**
   * Log a user in using native authentication
   *
   * @param {req.body.username} Username of user trying to log in
   * @param {req.body.password} Password of user trying to log in
   * @return { 200, {username, primary_email} }
   */
  app.post("/v1/session", async (req, res) => {
    console.log("Login attempt:", req.body);

    const schema = Joi.object({
      username: Joi.string().lowercase().required(),
      password: Joi.string().required(),
    });

    try {
      const data = await schema.validateAsync(req.body, { stripUnknown: true });

      // Search database for user
      try {
        let user = await app.models.User.findOne({ username: data.username });
        if (!user) {
          console.log("User not found.");
          return res.status(401).send({ error: "unauthorized" });
        }

        // Authenticate the user
        if (await user.authenticate(data.password)) {
          // Regenerate session when signing in to prevent fixation
          req.session.regenerate(() => {
            req.session.user = user;
            console.log(`Session.login success: ${req.session.user.username}`);
            res.status(200).send({
              username: user.username,
              primary_email: user.primary_email,
            });
          });
        } else {
          console.log("Authentication failed: Incorrect credentials.");
          res.status(401).send({ error: "unauthorized" });
        }
      } catch (err) {
        console.error(`Error searching user: ${err}`);
        res.status(500).send({ error: "internal server error" });
      }
    } catch (err) {
      console.error(`Validation failure: ${err.details[0].message}`);
      res.status(400).send({ error: err.details[0].message });
    }
  });

  /**
   * Log a user out
   *
   * @return { 204 if was logged in, 200 if no user in session }
   */
  app.delete("/v1/session", (req, res) => {
    if (req.session.user) {
      console.log("Logging out user:", req.session.user.username);
      req.session.destroy(() => {
        res.status(204).end();
      });
    } else {
      console.log("No user to log out.");
      res.status(200).end();
    }
  });

  /**
   * Get current session user data
   */
  app.get("/v1/session", (req, res) => {
    if (req.session.user) {
      const user = req.session.user;
      res.status(200).send({
        username: user.username,
        primary_email: user.primary_email,
        first_name: user.first_name,
        last_name: user.last_name,
        city: user.city,
      });
    } else {
      res.status(401).send({ error: "Unauthorized" });
    }
  });
};
