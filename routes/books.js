const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../models');
const { Book } = db;

// Handle requests for the favicon.ico file
router.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

router.get('/search', async function (req, res, next) {
  const category = req.query.category;
  const search = req.query.search.toLowerCase();
  const books = await Book.findAll();

  // No results found
  if (!search.trim()) {
    return res.render('error', { error: {}, title: "No results were found." });
  }

  // Ensure books array is not empty
  if (books.length === 0) {
    return res.render('error', { error: {}, title: "No books found." });
  }

  // Filter books based on category and search query
  const filteredBooks = books.filter(book => {

    if (!book || !book.title || !book.author || !book.genre) return false;

    const title = book.title.toLowerCase();
    const author = book.author.toLowerCase();
    const genre = book.genre.toLowerCase();

    if (category === 'title' && title.includes(search)) {
      return true;
    } else if (category === 'author' && author.includes(search)) {
      return true;
    } else if (category === 'genre' && genre.includes(search)) {
      return true;
    } else if (category === 'year' && book.year === parseInt(search)) {
      return true;
    }

    return false;
  });


  // Render the filtered books
  if (filteredBooks.length > 0) {
    res.render('home-btn', { books: filteredBooks, title: 'Results' });
  } else {
    res.render('error', { error: {}, title: "No results were found." });
  }
});


/* get form to create a new book */
router.get('/books/new', async (req, res, next) => {
  try {
    res.render('new-book', { title: 'New Book' });
  } catch (error) {
    next(error);
  }
});

/* post new book entry */
router.post('/new', async (req, res, next) => {
  try {
    const { title, author, genre, year } = req.body;
    if (!title || !author) {
      return res.status(400).send('Title and author are required.');
    }
    const newBook = await Book.create({ title, author, genre, year });
    res.redirect('/');
  } catch (error) {
    console.error('Error creating new book:', error);
    if (error.name === 'SequelizeValidationError') {

      return res.status(400).send('Validation error: ' + error.message);
    }
    res.status(500).send('Internal Server Error');
  }
});


/* get form to update book info */
router.get('/:id', async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render('update-book', { book, title: 'Update Book' });
    } else {
      const errNotFound = new Error('That book was not found');
      errNotFound.status = 404;
      next(errNotFound);
    }
  } catch (error) {
    next(error);
  }
});

/* post to update book in db */
router.post('/:id', async (req, res, next) => {
  try {
    let book = await Book.findByPk(req.params.id);
    if (!book) return next();
    if (!req.body.title || !req.body.author) {
      return res.render('update-book', { book, title: 'Update Book' });
    }
    await book.update(req.body);
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

/* delete book in db */
router.post('/:id/delete', async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.sendStatus(404);
    await book.destroy();
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
