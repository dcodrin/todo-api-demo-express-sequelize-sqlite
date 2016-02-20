//Use bcrypt to hash passwords. Hashing is a one way encryption.
//For example given ABC123 will always return the same hash however there is no way of retrieving ABC123 from the hash.

var bcrypt = require("bcrypt");
var crypto = require("crypto-js");
var jwt = require("jsonwebtoken");


//there's a specific format for a file that is being called with sequelize.import (what we do in db.js)
//we have to export a special function that get's passed two arguments by sequelize, the first is the sequelize instance, the second is the Sequelize DataTypes object.
//See sequelize documentation under Dataypes in API for reference.

module.exports = (sequelize, DataTypes)=> {
    //NOTE that we have to return the user variable at the end of the function;
    var user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            //Unique makes sure that there are no other instances in the database with the same values
            unique: true,
            validate: {
                isEmail: true
            }
        },
        passwordHash: {
            type: DataTypes.STRING
        },
        //
        password: {
            //Since we set the 'type' to be a VIRTUAL type, it will not be stored in the database.
            //We will store the salt and the passwordHash to be able to authorize users.
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                //the min. length is 5 and the max is 30 characters.
                len: [5, 30]
            },
            //The set function receives the current value, in this case the password.
            set: function (value) {
                //The 'value' in this case is the password which gets passed in by sequelize to the function
                var hashedPassword = bcrypt.hashSync(value, 10);
                //the this in this case refers to the user model
                //We are setting the password to our value;
                this.setDataValue('password', value);
                //We are setting the passwordHash field using the hashedPassword variable.
                this.setDataValue('passwordHash', hashedPassword);
            }
        }
    }, {//We pass a third argument that will hold our hooks. Hooks can be used to do some date manipulation before or after certain actions.
        //In this case we use hooks to set the email field to lower case before attempting to validate it.
        //Notice this would be the same place we can pass our validation functions.
        hooks: {
            beforeValidate: function (user, options) {
                // take user.email and convert to lower case if it's a string
                if (typeof user.email === "string") {
                    user.email = user.email.toLowerCase()
                }
            }
        },
        //instanceMethods allows us to create functions to manipulate our instance data. When we called update() on
        // a todo item that was an instance method.
        instanceMethods: {
            //This instance method will return a new filtered object that only includes data that we filter out.
            toPublicJSON: function () {
                var json = this.toJSON();
                //Because we dont want the user to see the password or the salt or hash we do not send those back to
                // the user.
                var userInfo = {};
                userInfo.id = json.id;
                userInfo.email = json.email;
                userInfo.createdAt = json.createdAt;
                userInfo.updatedAt = json.updatedAt;
                return userInfo;
            },
            generateToken: function (type) {
                //the type is used to differentiate between login or forgotten password for example.
                //type is a string (ex "authentication")
                if (typeof type !== "string") {
                    return null;
                }
                //We make use of try catch for this part. Try will try to run the code and if there is an error it
                // will be passed onto catch.
                try {
                    //We are creating a string for crypto.
                    var stringData = JSON.stringify({id: this.get("id"), type: type});
                    //We use the string that we created to pass it to crypto and also pass it a global password "abc123"
                    var encryptedData = crypto.AES.encrypt(stringData, "abc123").toString();
                    //We create our token
                    var token = jwt.sign({
                        token: encryptedData
                    }, "abc");
                    return token;
                }
                catch (e) {
                    console.error(e);
                    return null;
                }
            }
        },
        //A class method can be used on the model (ex user, todo). We are creating our own class methods
        classMethods: {
            authentication: function (body) {
                //We have to return a new promise.
                return new Promise((resolve, reject)=> {
                    //Check that the data is a string. If not return an error.
                    if (typeof body.email !== "string" || typeof body.password !== "string") {
                        //Note reject is a the second function being passed to our then in server.js.
                        return reject();
                    }
                    //Use findOne to find one match. Note emails are unique.
                    //note the user refers to this same user variable we are working in
                    user.findOne({
                        where: {
                            email: body.email
                        }
                    }).then((user)=> {
                        //Use bcrypt to check the user password. bcrypt takes a string and compares it against a hash. We use the
                        // .get() method to retrieve the passwordHash from the current instance, user.
                        if (!user || !bcrypt.compareSync(body.password, user.get("passwordHash"))) {
                            return reject();
                        } else {
                            resolve(user);
                        }
                        //Notice that we pass a second function to our then to account for errors.
                    }, (e)=> {
                        reject();
                        //We also use catch to catch any other unexpected error.
                    }).catch((e)=> {
                        reject();
                    });
                })
            },
            findByToken: function (token) {
                return new Promise((resolve, reject)=> {
                    //We are using a try catch block again
                    try {
                        //The steps to decrypt the data
                        var decodedJWT = jwt.verify(token, "abc");
                        var bytes = crypto.AES.decrypt(decodedJWT.token, "abc123");
                        var tokenData = JSON.parse(bytes.toString(crypto.enc.Utf8));

                        //Now we have access to the id and type
                        user.findById(tokenData.id).then((user)=>{
                            if(user){
                                resolve(user);
                            } else {
                                reject();
                            }
                        }, (e)=>{
                            reject()
                        })

                    }
                    catch (e) {
                        reject();
                    }
                })
            }
        }
    });
    return user;
};