const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

function isAuthenticated(req, res, next) {
    const token = req.cookies.accessToken;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.clearCookie('accessToken');
                req.user = null;
                return next();
            }
            req.user = decoded;
            next();
        });
    } else {
        req.user = null;
        next();
    }
}

router.get('/', async (req, res) => {
    console.log('Session:', req.session);
    
    try {
        if (req.session.user) {
            return res.render('index', {
                user: req.session.user,
                error: null,
                success: null
            });
        }
        
        res.redirect('/auth/login/callback');
    } catch (error) {
        console.error('Error in index route:', error);
        res.redirect('/auth/login/callback');
    }
});

module.exports = router;