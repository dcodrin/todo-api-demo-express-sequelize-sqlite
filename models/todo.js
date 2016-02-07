//there's a specific format for a file that is being called with sequelize.import (what we do in db.js)
//we have to export a special function that get's passed two arguments by sequelize, the first is the sequelize instance, the second is the Sequelize DataTypes object.
//See sequelize documentation under Dataypes in API for reference.


module.exports = (sequelize, DataTypes)=> {
    //Notice that we no longer call Sequelize.STRING
    return sequelize.define('todo', {
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]
            }
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        validate: {
            //THESE CANNOT USE ES6 notation
            descriptionIsString: function () {
                if (typeof this.description !== "string") {
                    throw new Error('Description must be string.')
                }
            },
            completedIsBoolean: function () {
                if (typeof this.completed !== "boolean") {
                    throw new Error("Completed must be boolean")
                }
            }
        }
    });
};