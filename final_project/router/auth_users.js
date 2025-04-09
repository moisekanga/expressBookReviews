const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // Check if username exists in the users array
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Check if username and password match the one we have in records
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  // Get username and password from request body
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  // Check if user exists and password is correct
  if (authenticatedUser(username, password)) {
    // Generate JWT token
    const accessToken = jwt.sign({ username: username }, "access", { expiresIn: '1h' });

    // Store token in session
    req.session.authorization = { accessToken };

    return res.status(200).json({message: "Login successful", accessToken});
  } else {
    return res.status(401).json({message: "Invalid username or password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Get the ISBN from request parameters
  const isbn = req.params.isbn;

  // Get the review from request body
  const review = req.body.review;

  // Get the username from the JWT token
  const username = req.user.username;

  // Check if the book with the given ISBN exists
  if (books[isbn]) {
    // Add the review to the book
    books[isbn].reviews[username] = review;

    return res.status(200).json({message: "Review added successfully"});
  } else {
    return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Get the ISBN from request parameters
  const isbn = req.params.isbn;

  // Get the username from the JWT token
  const username = req.user.username;

  // Check if the book with the given ISBN exists
  if (books[isbn]) {
    // Check if the user has a review for this book
    if (books[isbn].reviews[username]) {
      // Delete the review
      delete books[isbn].reviews[username];
      return res.status(200).json({message: "Review deleted successfully"});
    } else {
      return res.status(404).json({message: `No review found for ISBN ${isbn} by user ${username}`});
    }
  } else {
    return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
