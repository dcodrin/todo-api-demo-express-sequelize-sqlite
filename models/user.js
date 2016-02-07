//there's a specific format for a file that is being called with sequelize.import (what we do in db.js)
//we have to export a special function that get's passed two arguments by sequelize, the first is the sequelize instance, the second is the Sequelize DataTypes object.
//See sequelize documentation under Dataypes in API for reference.

module.exports = (sequelize, DataTypes)=> {
    return sequelize.define('user', {
       email: {
           type: DataTypes.STRING,
           allowNull: false,
    //Unique makes sure that there are no other instances in the database with the same values
           unique: true,
           validate: {
               isEmail: true
           }
       },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                //the min. length is 5 and the max is 30 characters.
                len: [5, 30]
            }
        }
    }, {//We pass a third argument that will hold our hooks. Hooks can be used to do some date manipulation before or after certain actions.
        //In this case we use hooks to set the email field to lower case before attempting to validate it.
        //Notice this would be the same place we can pass our validation functions.
        hooks : {
            beforeValidate: function(user, options){
                // take user.email and convert to lower case if it's a string
                if(typeof user.email === "string"){user.email = user.email.toLowerCase()}
            }
        }
    });
};