var cryptojs = require("crypto-js");

module.exports = (db)=> {
    return {
        requireAuthentication: (req, res, next)=> {
            //We are storing the token from the header, to whom we gave a name of Auth
            var token = req.get("Auth") || "";
            db.token.findOne({
                where: {
                    tokenHash: cryptojs.MD5(token).toString()
                }
            }).then((tokenInstance)=> {
                if (!tokenInstance) {
                    throw new Error();
                }

                req.token = tokenInstance;
                return db.user.findByToken(token)

            }).then((user)=> {
                req.user = user;
                next();
            }).catch(()=> {
                res.status(401).send();
            });
        }
    };
};