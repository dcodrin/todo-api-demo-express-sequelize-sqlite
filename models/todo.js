module.exports = (sequelize, DataTypes)=> {
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