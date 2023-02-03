const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const redis = require("redis");
const client = redis.createClient();

const User = require("./models/user");
const app = express();

mongoose.connect("mongodb://127.0.0.1:27017");

const secret = "yoursecretkey";

app.use(express.json());
app.get("/", function (req, res) {
  let token = jwt.sign(secret, "secretKey");
  res.json({ tutorial: "Build REST API with node.js", token });
});
app.listen(3000, async function () {
  await client.connect();
  console.log("Node server listening on port 3000");
});

// Middleware to validate JWT
const validateJWT = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  console.log({
    authorizationHeader,
    check: !authorizationHeader,
  });
  if (!authorizationHeader) return res.status(401).send("Unauthorized");

  const token = authorizationHeader.split(" ")[1];
  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err) return res.status(401).send("Unauthorized");
    req.user = decoded;
    console.log();
    next();
  });
};

// Get all users
app.get("/users", validateJWT, async (req, res) => {
  User.find({})
    .then((users) => {
      client.set("users", JSON.stringify(users));
      res.send(users);
    })
    .catch((err) => res.status(500).send("Error"));
});

// Get a single user by accountNumber
app.get("/users/:accountNumber", validateJWT, (req, res) => {
  const userId = req.params.accountNumber;
  User.findById(userId)
  .then((user) => {
    client.set(userId, JSON.stringify(user));
    res.send(user);
  })
  .catch((err) => res.status(500).send("Error"));
});

// Get a single user by identityNumber
app.get("/users/identityNumber", validateJWT, (req, res) => {
  const userId = req.params.identityNumber;
  User.findById(userId)
  .then((user) => {
    client.set(userId, JSON.stringify(user));
    res.send(user);
  })
  .catch((err) => res.status(500).send("Error"));
});

// Create a new user
app.post("/users", validateJWT, (req, res) => {
  const user = new User(req.body);
  user
    .save()
    .then(() => {
      client.del("users");
      res.send(user);
    })
    .catch((err) => res.status(500).send(JSON.stringify(err)));
});

// // Update a user by accountNumber
app.put('/users/:accountNumber', validateJWT, (req, res) => {
  const userId = req.params.accountNumber;
  User.findByIdAndUpdate(userId, req.body)
    .then((result) => {
      res.send(result)
    })
    .catch((err) => res.status(500).send(JSON.stringify(err)));
})

// // Update a user by identityNumber
app.put('/users/:identityNumber', validateJWT, (req, res) => {
  const userId = req.params.identityNumber;
  User.findByIdAndUpdate(userId, req.body)
    .then((result) => {
      res.send(result)
    })
    .catch((err) => res.status(500).send(JSON.stringify(err)));
})

// // delete a user by identityNumber
app.delete('/users/:identityNumber', validateJWT, (req, res) => {
  const userId = req.params.identityNumber;
  User.findOneAndDelete(userId, req.body)
    .then((result) => {
      res.send(result)
    })
    .catch((err) => res.status(500).send(JSON.stringify(err)));
})    

// // delete a user by accountNumber
app.delete('/users/:accountNumber', validateJWT, (req, res) => {
  const userId = req.params.accountNumber;
  User.findOneAndDelete(userId, req.body)
    .then((result) => {
      res.send(result)
    })
    .catch((err) => res.status(500).send(JSON.stringify(err)));
})  
