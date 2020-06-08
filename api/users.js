const express = require("express");
const bcrypt = require("bcrypt");

const usersRouter = express.Router();
const jwt = require("jsonwebtoken");

const {
  createUser,
  getUserByUsername,
  getPublicRoutinesByUser,
} = require("../db");

//users

// ***POST /users/register
// Create a new user. Require username and password,
// and hash password before saving user to DB.
// Require all passwords to be at least 8 characters long.

// Throw errors for duplicate username, or password-too-short.

usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  const SALT_COUNT = 10;
  const _user = await getUserByUsername(username);
  if (_user) {
    next({
      name: "UserExistsError",
      message: "A user by that username already exists",
    });
  }

  bcrypt.hash(password, SALT_COUNT, async function (err, hashedPassword) {
    console.log(password, SALT_COUNT, hashedPassword);
    const user = await createUser({
      username,
      password: hashedPassword, // ***not the plaintext
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );
    res.send({
      message: "thank you for signing up",
      token,
    });
  });
});

//*** */ POST /users/login
// Log in the user. Require username and password, and verify that plaintext login password
// matches the saved hashed password before returning a JSON Web Token.
// Keep the id and username in the token.

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  console.log(req.body);
  const user = await getUserByUsername(username);
  const hashedPassword = user.password;
  console.log(password, hashedPassword);
  bcrypt.compare(password, hashedPassword, function (err, passwordsMatch) {
    console.log(passwordsMatch);
    if (passwordsMatch) {
      // ***return a JWT
      const token = jwt.sign(
        {
          id: user.id,
          username,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1w",
        }
      );
      res.send({
        message: "thank you for logging in",
        token,
      });
    } else {
      res.send({ err });
    }
  });
});

//*** */ GET /users/:username/routines
// Get a list of public routines for a particular user.

usersRouter.get("/:username/routines", async (req, res) => {
  const users = await getPublicRoutinesByUser(req.params);

  res.send({
    users,
  });
});

module.exports = usersRouter;
