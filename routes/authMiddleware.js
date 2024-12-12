function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login/callback');
}

module.exports = ensureAuthenticated;