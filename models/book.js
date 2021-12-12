const mongoose = require('mongoose')
const path = require('path')

const coverImageBasePath = 'uploads/bookCovers'

let Book = mongoose.Schema({
  Title: String,
  Description: String,
  Price: Number,
  Author: String,
  Genre: String
},
{
collection: "books"
});

Book.virtual('coverImagePath').get(function() {
  if (this.coverImageName != null) {
    return path.join('/', coverImageBasePath, this.coverImageName)
  }
})

module.exports = mongoose.model('Book', Book);
module.exports.coverImageBasePath = coverImageBasePath