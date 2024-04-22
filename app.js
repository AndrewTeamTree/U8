var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var createError = require('http-errors');
const db = require('./models');
var indexRouter = require('./routes/index');
var booksRouter = require('./routes/books');

var app = express();

(async () => {
  try {
    await db.sequelize.authenticate();
    db.sequelize.sync();
  } catch (error) {
    console.error('Authentication failed: db not synced' + error);
  }
})();

// Set up view engine
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/books', booksRouter);

// Handle requests for the favicon.ico file
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
