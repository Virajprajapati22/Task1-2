const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    authors: {
        type: [String], // List of authors
        required: true,
    },
    description: {
        type: String,
        required: false, // Optional field
    },
    category: {
        type: String,
        required: false,
    },
    publisher: {
        type: String,
        required: false,
    },
    price: {
        type: String,
        required: true,
        min: 0, // Minimum value for price
    },
});

const Book = mongoose.model('Book', BookSchema);

module.exports = Book;
