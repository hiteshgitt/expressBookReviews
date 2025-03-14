const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper function to simulate API call to get all books
const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        resolve(books);
      }, 1000);
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to simulate API call to get book by ISBN
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject(new Error("Book not found"));
        }
      }, 1000);
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to simulate API call to get books by author
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        const booksByAuthor = {};
        Object.keys(books).forEach(isbn => {
          if (books[isbn].author === author) {
            booksByAuthor[isbn] = books[isbn];
          }
        });
        
        if (Object.keys(booksByAuthor).length > 0) {
          resolve(booksByAuthor);
        } else {
          reject(new Error("No books found for this author"));
        }
      }, 1000);
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to simulate API call to get books by title
const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        const booksByTitle = {};
        Object.keys(books).forEach(isbn => {
          if (books[isbn].title === title) {
            booksByTitle[isbn] = books[isbn];
          }
        });
        
        if (Object.keys(booksByTitle).length > 0) {
          resolve(booksByTitle);
        } else {
          reject(new Error("No books found with this title"));
        }
      }, 1000);
    } catch (error) {
      reject(error);
    }
  });
};

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }
  
  // Check if user already exists
  if (users.some(user => user.username === username)) {
    return res.status(409).json({
      message: "Username already exists"
    });
  }
  
  // Add new user
  users.push({ username, password });
  
  return res.status(200).json({
    message: "User registered successfully",
    username
  });
});

// Task 10: Get the book list available in the shop (Using Promise)
public_users.get('/', function (req, res) {
  getAllBooks()
    .then(books => {
      return res.status(200).json(books);
    })
    .catch(error => {
      return res.status(500).json({ message: error.message });
    });
});

// Task 10: Alternative implementation using Async/Await
/*
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
*/

// Task 11: Get book details based on ISBN (Using Promise)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  getBookByISBN(isbn)
    .then(book => {
      return res.status(200).json(book);
    })
    .catch(error => {
      return res.status(404).json({ message: error.message });
    });
});

// Task 12: Get book details based on author (Using Async/Await)
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  
  try {
    const booksByAuthor = await getBooksByAuthor(author);
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 13: Get all books based on title (Using Async/Await)
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  
  try {
    const booksByTitle = await getBooksByTitle(title);
    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  if (books[isbn]) {
    return res.status(200).json({
      reviews: books[isbn].reviews
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;