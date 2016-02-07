//Use bcrypt to hash passwords. Hashing is a one way encryption.
//For example given ABC123 will always return the same hash however there is no way of retrieving ABC123 from the hash.

var bcrypt = require("bcrypt");


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
        //Salting means adding a random set of characters to the string password before it's hashed. This is to make sure that no two passwords are the same.
        salt: {
            type: DataTypes.STRING
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
                //create the salt
                var salt = bcrypt.genSaltSync(10);
                //we are salting and hashing the password
                var hashedPassword = bcrypt.hashSync(value, salt);
                //the this in this case refers to the user model
                //We are setting the password to our value;
                this.setDataValue('password', value);
                //We are setting the salt to the salt variable
                this.setDataValue('salt', salt);
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
            }
        }
    });
    return user;
};