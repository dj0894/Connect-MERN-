const jwt = require('jsonwebtoken');
const config = require('config');


module.exports = function (req, res, next) {
    //getToken from header
    const token = req.header('x-auth-token');
    //check if no token available
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    //verify token if present
    try {

        const decoded = jwt.verify(token, config.get('jwtToken')); //jwt.verify() used to verify the token param 1=taken from header, parameter 2: jwtToken secret defined in default.js
        req.user = decoded.user; // as we ae getting user's id  from decoded . We have set users id as payload in users.js.Now we can user req.user for further to check user profile
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }

}