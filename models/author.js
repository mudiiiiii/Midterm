let mongoose = require('mongoose')

let authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Author', authorSchema)