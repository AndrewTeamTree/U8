const express = require('express');
const router = express.Router();







/* GET home page, re-direct to /books */
router.get('/', function (req, res, next) {
    res.redirect('/books');
});

module.exports = router;
