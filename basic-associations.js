//This is used for testing purposes only.

var Sequelize = require("sequelize");
var sequelize = new Sequelize(undefined, undefined, undefined, {
    "dialect": "sqlite",
    "storage": "basic-sqlite-database.sqlite"
});

//Create a data model.
var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});


var User = sequelize.define('user', {
    email: Sequelize.STRING
});

Todo.belongsTo(User);
User.hasMany(Todo);

//Example of chaining promises.
//{force:true} when passed to sync resets the database
sequelize.sync().then(()=> {
    console.log("Everything is synced.");

    User.findById(1).then((user)=>{
        //This is a sequelize function.
        //Notice where we place the where method
        user.getTodos({
            where: {
                completed: false
            }
        }).then((todos)=>{
            todos.forEach((todo)=>{
                console.log(todo.toJSON());
            })
        })
    });

    User.create({
        email: "scooby@mail.com"
    }).then(()=>{
       return Todo.create({
            description: "Clean the house"
        })
    }).then((todo)=>{
        User.findById(1).then((user)=>{
            //This is a built in functionality. It sets the database association for us.
            user.addTodo(todo);
        })
    })

});