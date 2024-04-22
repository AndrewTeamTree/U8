const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../models');
const { Book } = db;

// Handle requests for the favicon.ico file
router.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});


/* GET form to create a new book */
router.get('/new', async function (req, res, next) {
  res.render('new-book', { title: "New Book" });
});

/* POST new book entry */
router.post('/new', async function (req, res, next) {
  try {
    const { title, author, genre, year } = req.body;
    const newBook = await Book.create({ title, author, genre, year });
    res.redirect('/');
  } catch (error) {
    console.error('Error creating new book:', error);
    res.status(500).send('Internal Server Error');
  }
});


/* GET form to update book info */
router.get('/:id', async function (req, res, next) {
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

/* POST to update book in db */
router.post('/:id', async function (req, res, next) {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      if (!req.body.title || !req.body.author) {
        res.render("form-error-update", { book, title: "Update Book" });
      } else {
        await book.update(req.body);
        res.redirect("/");
      }
    } else {
      next();
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("form-error-update", { book, title: "Update Book" })
    } else {
      throw error;
    }
  }
});

/* DELETE book in db */
router.post('/:id/delete', async function (req, res, next) {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect("/");
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;
