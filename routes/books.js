const express = require('express');
const router = express.Router();
const db = require('../models');
const { Book } = db;

/* GET books listing */
router.get('/', async function (req, res, next) {
  try {
    // Pagination variables
    const page = req.query.page || 1; // Current page number, default is 1
    const limit = 10; // Number of books per page

    const offset = (page - 1) * limit; // Offset based on current page

    // Find total number of books
    const totalCount = await Book.count({});

    // Find books for the current page
    const books = await Book.findAll({
      limit: limit,
      offset: offset
    });

    // Calculate total number of pages
    const totalPages = Math.ceil(totalCount / limit);

    // Render the main page with pagination data
    res.render('index', {
      books,
      title: "Books",
      currentPage: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    next(error);
  }
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
    res.render('home', { books: filteredBooks, title: 'Results' });
  } else {
    res.render('error', { error: {}, title: "No results were found." });
  }
});


/* get form to create a new book */
router.get('/new', async (req, res, next) => {
  try {
    res.render('new-book', { title: 'New Book' });
  } catch (error) {
    next(error);
  }
});

/* post new book entry */
router.post('/new', async function (req, res, next) {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/");
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render('book-update-error', { title: 'New Book' });
    } else {
      throw error;
    }
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




router.post('/:id', async (req, res, next) => {
  const { title, author, genre, year } = req.body;
  const bookId = req.params.id;

  try {
    const book = await Book.findByPk(bookId);

    if (!book) {
      const errNotFound = new Error('That book was not found');
      errNotFound.status = 404;
      throw errNotFound;
    }

    // Check if title or author is blank
    if (!title.trim() || !author.trim()) {
      const errors = [];
      if (!title.trim()) {
        errors.push({ msg: 'Title is required' });
      }
      if (!author.trim()) {
        errors.push({ msg: 'Author is required' });
      }
      // Render the update book form again with errors
      return res.render('update-book', { book, title: 'Update Book', errors });
    }

    // Update the book information
    await Book.update({
      title,
      author,
      genre,
      year
    }, {
      where: { id: bookId }
    });

    // Redirect to the home page
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
