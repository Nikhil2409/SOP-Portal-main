const passport = require('../controllers/passport');
const router = require('express').Router();

// Empty by default: the frontend is served from this same server, so redirects stay relative.
const CLIENT_URL = process.env.CLIENT_URL || '';

router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    return res.redirect(`${CLIENT_URL}/${req.user.type}`);
});

router.get('/logout', (req, res) => {
    req.logout({},(err)=>{
        if(err){
            return res.status(500).json({message: 'Could not log out user'});
        }
        return res.redirect(`${CLIENT_URL}/login`);
    });
});

router.get('/user', (req, res) => {
    if(req.isAuthenticated()){
        return res.json({email: req.user.emails[0].value, type: req.user.type, id:req.user.mongoid, name:req.user.displayName, image:req.user.photos[0].value});
    }
    return res.status(401).json({message: 'User not authenticated'});
});

module.exports = router;
