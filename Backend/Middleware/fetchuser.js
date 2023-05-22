require("dotenv").config();
var jwt = require("jsonwebtoken");
const fetchuser = (req, res, next) => {
    const token = req.header('Authorization');
    if(!token) return res.sendStatus(401);
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = data.user;
        next();
    } catch (error) {
        res.sendStatus(401);
    }
};

module.exports = fetchuser;