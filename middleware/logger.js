//Middleware
//@desc logs req to console
const logger = (req, res, next) => {
    // req.hello = ' hello world';
    console.log(`${req.method} ${req.protocol}://${req.get('host')} ${req.originalUrl}`);
    next();

}
module.exports = logger;