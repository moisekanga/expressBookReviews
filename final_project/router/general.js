const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  // Get username and password from request body
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  // Check if username already exists
  if (users.find(user => user.username === username)) {
    return res.status(409).json({message: `Username ${username} already exists`});
  }

  // Add new user to the users array
  users.push({ username, password });

  return res.status(201).json({message: "User registered successfully"});
});

// Task 10: Get the book list available in the shop using async-await with timeout
public_users.get('/', async (req, res) => {
  try {
    // Create a promise that resolves after a delay
    const fetchBooks = () => {
      return new Promise((resolve) => {
        // Simulate network delay with setTimeout
        setTimeout(() => {
          resolve(books);
        }, 1000); // 1 second delay
      });
    };

    // Use await to wait for the Promise to resolve
    const booksData = await fetchBooks();

    // Return the list of all books with JSON.stringify for neat display
    return res.status(200).send(JSON.stringify(booksData, null, 2));
  } catch (error) {
    console.error('Error fetching books:', error.message);
    return res.status(500).json({ message: 'Error fetching books' });
  }
});

// Task 11: Get book details based on ISBN using async-await with timeout
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    // Get the ISBN from request parameters
    const isbn = req.params.isbn;

    // Create a promise that resolves after a delay
    const fetchBookByISBN = (isbn) => {
      return new Promise((resolve, reject) => {
        // Simulate network delay with setTimeout
        setTimeout(() => {
          if (books[isbn]) {
            resolve(books[isbn]);
          } else {
            reject(new Error(`Book with ISBN ${isbn} not found`));
          }
        }, 1000); // 1 second delay
      });
    };

    // Use await to wait for the Promise to resolve
    const bookData = await fetchBookByISBN(isbn);
    return res.status(200).json(bookData);
  } catch (error) {
    console.error(`Error fetching book:`, error.message);
    return res.status(404).json({ message: error.message });
  }
});

// Task 12: Get book details based on author using async-await with timeout
public_users.get('/author/:author', async (req, res) => {
  try {
    // Get the author from request parameters
    const author = req.params.author;

    // Create a promise that resolves after a delay
    const fetchBooksByAuthor = (author) => {
      return new Promise((resolve, reject) => {
        // Simulate network delay with setTimeout
        setTimeout(() => {
          const bookKeys = Object.keys(books);
          const booksByAuthor = {};

          bookKeys.forEach(key => {
            if (books[key].author === author) {
              booksByAuthor[key] = books[key];
            }
          });

          if (Object.keys(booksByAuthor).length > 0) {
            resolve(booksByAuthor);
          } else {
            reject(new Error(`No books found by author: ${author}`));
          }
        }, 1000); // 1 second delay
      });
    };

    // Use await to wait for the Promise to resolve
    const authorBooks = await fetchBooksByAuthor(author);
    return res.status(200).json(authorBooks);
  } catch (error) {
    console.error(`Error fetching books by author:`, error.message);
    return res.status(404).json({ message: error.message });
  }
});

// Task 13: Get all books based on title using async-await with timeout
public_users.get('/title/:title', async (req, res) => {
  try {
    // Get the title from request parameters
    const title = req.params.title;

    // Create a promise that resolves after a delay
    const fetchBooksByTitle = (title) => {
      return new Promise((resolve, reject) => {
        // Simulate network delay with setTimeout
        setTimeout(() => {
          const bookKeys = Object.keys(books);
          const booksByTitle = {};

          bookKeys.forEach(key => {
            // Using includes for partial title matches
            if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
              booksByTitle[key] = books[key];
            }
          });

          if (Object.keys(booksByTitle).length > 0) {
            resolve(booksByTitle);
          } else {
            reject(new Error(`No books found with title containing: ${title}`));
          }
        }, 1000); // 1 second delay
      });
    };

    // Use await to wait for the Promise to resolve
    const titleBooks = await fetchBooksByTitle(title);
    return res.status(200).json(titleBooks);
  } catch (error) {
    console.error(`Error fetching books by title:`, error.message);
    return res.status(404).json({ message: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Get the ISBN from request parameters
  const isbn = req.params.isbn;

  // Check if the book with the given ISBN exists
  if (books[isbn]) {
    // Return the reviews for the book
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
  }
});

module.exports.general = public_users;
