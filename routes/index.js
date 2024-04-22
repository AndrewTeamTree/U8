const express = require('express');
const router = express.Router();
const db = require('../models');
const { Book } = db;



router.get('/', async function (req, res, next) {
    try {
        const books = await Book.findAll({ limit: 15 });
        console.log(books); // Add this line to log the fetched books
        res.render('index', { books, title: "Books" });
    } catch (error) {
        console.error('Error fetching books:', error);
        next(error);
    }
});


module.exports = router;
