const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username, password)=>{ //returns boolean
  let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    console.log(users)
  if(!isValid(username, password)) return null;
  
  return users.filter((user) => {
        return (user.username === username && user.password === password);
    })[0];
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  const hadOne = book.reviews.hasOwnProperty(req.session.authorization.username);

  book.reviews[req.session.authorization.username] = req.query.review
  return res.status(200).send(hadOne ? "review updated" : "review added" );
    
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const book = books[req.params.isbn];
    const hadOne = book.reviews.hasOwnProperty(req.session.authorization.username);
    delete book.reviews[req.session.authorization.username];
    return res.status(200).send(hadOne ? "review deleted" : "Had no review, nothing done" );
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
