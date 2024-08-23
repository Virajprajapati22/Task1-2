const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs'); // Ensure fs module is required
const app = express();
const Book = require('./models/Book');
const cors = require('cors');

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000' // Replace with your frontend's origin
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

mongoose.connect('mongodb://127.0.0.1:27017/author-book-db?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('Error:', err);
});

/// Set up multer for file upload
const upload = multer({ dest: 'uploads/' }); // Store files temporarily in 'uploads/' directory

// Route to handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    try {
        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        // Process and save data to MongoDB
        const books = jsonData.map(data => ({
            title: data['Title'],
            authors: data['Authors'] ? data['Authors'].split(',') : [],
            description: data['Description'] ?? " ",
            category: data['Category'] ?? " ",
            publisher: data['Publisher'] ?? " ",
            price: data['Price'] ? parseFloat(data['Price']) : 0,
        }));

        await Book.insertMany(books);

        // Remove the file after processing
        fs.unlinkSync(filePath);

        res.status(200).send({ message: 'File uploaded and data saved to database successfully' });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Error processing file');
    }
});

// Start the server
app.listen(8000, () => {
    console.log('Server started on http://localhost:8000');
});
