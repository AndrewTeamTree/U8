
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

module.exports = router;
