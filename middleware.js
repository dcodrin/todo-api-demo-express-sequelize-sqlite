module.exports = (db)=> {
    return {
        requireAuthentication: (req, res, next)=> {
            //We are storing the token from the header, to whom we gave a name of Auth
            var token = req.get("Auth");
            //This is another custom class method
            db.user.findByToken(token).then((user)=> {
                //Here we add the user that matches the token to our request object
                req.user = user;
                next();
            }, ()=> {
                res.status(401).send("Authentication failed.")
            });
        }
    };
};