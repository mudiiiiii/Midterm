const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Book = require('../models/book')
const Author = require('../models/author')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

// All Books Route
router.get('/', async (req, res) => {
  let query = Book.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try {
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

router.get('/edit/:id', (req, res, next)=> {
    let id = req.params.id;

    Book.findById(id, (err, bookToEdit) => {
      if(err){
        console.log(err);
        res.end(err);
      }
      else
      {
        res.render('books/edit', {title: 'Edit Book', book: bookToEdit})
      }
    });
});

// New Book Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
})

router.get('/', (req, res, next) => {

  Book.find((err, bookList) => {
      if (err) {
          return console.error(err);
      } else {
          //console.log(BookList);

          res.render('books/index', {title: 'Books', Books : books});
      }
  });

});

/* GET Route for displaying the Add page - CREATE operation. */
router.get('/new', (req, res, next) => {
  res.render('books/new', {title: 'Add Book'});
});

/* POST Route for processing the Add page - CREATE operation. */
router.post('/new', (req, res, next) => {
  let newBook = Book({
      "Title": req.body.Title,
      "Description": req.body.Description,
      "Price": req.body.Price,
      "Author": req.body.Author,
      "Genre": req.body.Genre
  });

  Book.create(newBook, (err, Book) => {
      if (err) {
          console.log(err);
          res.end(err);
      } else {
          
          res.redirect('/books');
      }
  });
});

// Create Book Route
router.post('/new', upload.single('cover'), async (req, res) => {
  let fileName = req.file != null ? req.file.filename : null
  let book = new Book({
    Title: req.body.Title,
    Description: req.body.Description,
    Price: req.body.Price,
    Author: req.body.Author,
    Genre: req.body.Genre,
  })

  try {
    const newBook = await book.save()
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`)
  } catch {
    if (book.coverImageName != null) {
      removeBookCover(book.coverImageName)
    }
    renderNewPage(res, book, true)
  }
})

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }
    if (hasError) params.errorMessage = 'Error Creating Book'
    res.render('books/new', params)
  } catch {
    res.redirect('/books')
  }
};

router.post('/edit/:id', (req, res, next) => {
  let id = req.params.id

  let updatedBook = Book({
    "_id":id,
    "Title": req.body.Title,
    "Description": req.body.Description,
    "Price": req.body.Price,
    "Author":req.body.Author,
    "Genre":req.body.Genre

  });
  Book.updateOne({_id: id}, updatedBook, (err) =>{
    if(err){
      console.log(err);
      res.end(err);
    }
    else{
      res.redirect('/books');
    }
  })

});

router.get('/delete/:id', (req,res,next) => {
  let id=req.params.id;

  Book.remove({_id:id},(err)=> {
    if(err)
    {
      console.log(err);
      res.end(err);
    }
    else{
      res.redirect('/books')
    }
  })
});

module.exports = router