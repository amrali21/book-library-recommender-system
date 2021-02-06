const ifLoggedin = (req,res,next) => {

    if(req.session.isLoggedIn){
        return res.redirect('/index');
    }
    next();
 
}

module.exports = ifLoggedin;