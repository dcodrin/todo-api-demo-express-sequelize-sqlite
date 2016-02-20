var cryptojs = require("crypto-js");

//First argument will be the individual instance and the second is the data type.
module.exports = function (sequelize, DataTypes) {

    return sequelize.define("token", {
        token: {
            //A VIRTUAL data type does not get stored in our db.
            type: DataTypes.VIRTUAL,
            allowNull: false,
            //Make sure the length is greater than 1
            validate: {
                len: [1]
            },
            set: function (value) {
                //We hash the token
                var hash = cryptojs.MD5(value).toString();
                //We still have to set our token from within the set function otherwise our code will break
                this.setDataValue("token", value);
                //After setting the token we will set the tokenHash
                this.setDataValue("tokenHash", hash);
            }
        },
        tokenHash: DataTypes.STRING
    })

};