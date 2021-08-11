const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
//const logger = require('./middleware/logger');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const fileupload = require('express-fileupload');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

//Load env vars
dotenv.config({
	path: './config/config.env',
});
//Connect to database
connectDB();
//Route files

const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

//body-parser
const bodyParser = require('body-parser');
app.use(express.json());


// Cookie parser
app.use(cookieParser());

// //Middleware
// const logger = (req, res, next) => {
//     // req.hello = ' hello world';
//     console.log(`${req.method} ${req.protocol}://${req.get('host')} ${req.originalUrl}`);
//     next();

// }
//app.use(logger);

//Dev login middleware
if (process.env.NODE_ENV === 'developement') {
	app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

//Sanitize data
app.use(mongoSanitize());

//Set security headers 
app.use(helmet()); 

//Prevent cross site scripting
app.use(xss());

// Rate limiting
const limiter = rateLimit({
	windowMe: 10 * 60 * 1000, //10 mins
	max: 100
});
app.use(limiter);

//Prevent http param pollution
app.use(hpp());

//enable cors
app.use(cors());


//set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers

app.use('/api/v1/bootcamps', bootcamps);

app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/auth/users', users);
app.use('/api/v1/auth/reviews', reviews);

//use the errorhandler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	)
);
//Handle unhandled rejection
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`.red);
	//Close sever and exit
	server.close(() => process.exit(1));
});