const express = require('express');

const connectToDb = require('./config/connectToDb');
const {notFound, errorHandler} = require('./middlewares/error');
require('dotenv').config();

//connection to db
connectToDb();

//init app
const app = express();

//middlewares
app.use(express.json());

//Routes
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/users', require('./routes/userRoute'));
app.use('/api/posts', require('./routes/postRoute'));
app.use('/api/comments', require('./routes/commentRoute'));
app.use('/api/categories', require('./routes/categoryRoute'));

// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

//running the server
app.listen(process.env.PORT, () => {
    console.log(`Server is running ${process.env.PORT}`);
});