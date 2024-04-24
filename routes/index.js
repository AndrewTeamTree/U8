

const express = require('express');
const router = express.Router();
const db = require('../models');
const { Book } = db;
//const { Op } = require('sequelize');

/* GET books listing */
router.get('/', async function (req, res, next) {
    try {
        const books = await Book.findAll({ limit: 8 });

        res.render('index', { books, title: "Books" });
    } catch (error) {
        console.error('Error fetching books:', error);
        next(error);
    }
});


module.exports = router;
