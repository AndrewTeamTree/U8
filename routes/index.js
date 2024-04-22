const express = require('express');
const router = express.Router();
const db = require('../models');
const { Book } = db;
const { Op } = require('sequelize');

/* GET books listing */
router.get('/', async function (req, res, next) {
    try {
        const books = await Book.findAll({ limit: 15 });

        res.render('index', { books, title: "Books" });
    } catch (error) {
        console.error('Error fetching books:', error);
        next(error);
    }
});

/* GET search books */
router.get('/search', async function (req, res, next) {
    const category = req.query.category;
    const search = req.query.search.toLowerCase();

    // Check if category and search query are provided
    if (!category || !search) {
        return res.status(400).send('Bad Request: Category and search query parameters are required.');
    }

    // Check if the category is valid
    const validCategories = ['title', 'author', 'genre', 'year'];
    if (!validCategories.includes(category)) {
        return res.status(400).send('Bad Request: Invalid category provided.');
    }

    try {
        const books = await Book.findAll({
            where: {
                [category]: {
                    [Op.like]: `%${search}%`, // Use Op.like for case-insensitive search
                },
            },
        });
        if (books.length > 0) {
            res.render('search-results', { category, search, books });
        } else {
            res.render('error', { error: {}, title: "No results were found." });
        }
    } catch (error) {
        console.error('Error fetching matched books:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
