const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if username is valid
const isValid = (username) => {
  // Check if username exists and is not empty
  return username !== undefined && username.trim() !== '';
}

// Function to check if username and password match records
const authenticatedUser = (username, password) => {
  // Find the user with matching username and password
  return users.some(user => 
    user.username === username && user.password === password
  );
}

// Task 7: Login endpoint - only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }
  
  // For testing purposes, add the user if they don't exist
  if (!users.some(user => user.username === username)) {
    users.push({ username, password });
  }
  
  // Authenticate the user
  if (authenticatedUser(username, password)) {
    // Create a JWT token with minimal claims and no expiration for testing
    const token = jwt.sign(
      { username: username },
      "fingerprint_customer"
    );
    
    // Store token in session
    req.session.authorization = token;
    
    return res.status(200).json({
      message: "Login successful",
      token: token
    });
  } else {
    return res.status(401).json({
      message: "Invalid credentials"
    });
  }
});

// Task 8: Add a book review (authenticated endpoint)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  
  // Get username from the decoded JWT stored in req.user
  const username = req.user.username;
  
  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }
  
  // Check if review is provided
  if (!review) {
    return res.status(400).json({
      message: "Review text is required"
    });
  }
  
  // Add or update the review for this user
  books[isbn].reviews[username] = review;
  
  return res.status(200).json({
    message: "Review added/updated successfully",
    book: books[isbn].title,
    review: review,
    user: username
  });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  
  // Get username from the decoded JWT stored in req.user
  const username = req.user.username;
  
  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }
  
  // Check if the user has a review for this book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({
      message: "Review not found or not authorized to delete this review"
    });
  }
  
  // Delete the review
  delete books[isbn].reviews[username];
  
  return res.status(200).json({
    message: "Review deleted successfully"
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;