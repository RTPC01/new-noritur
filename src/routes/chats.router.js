const express = require('express');
const router = express.Router();
const { checkAuthenticated } = require('../middleware/auth');

router.get('/', checkAuthenticated, (req, res) => {
    if (req.isAuthenticated()) {
        res.render('chat/chat', { username: req.user.username });
    } else {
        res.redirect('/login');
    }
});


module.exports = router;