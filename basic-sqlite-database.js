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

//Example of chaining promises.
//{force:true} when passed to sync resets the database
sequelize.sync({force: true}).then(()=> {
    console.log("Everything is synced.");

    Todo.create({
        description: "Buy milk"
    }).then((todo)=> {
        console.log(`Created todo: ${todo.description}`);
        return Todo.create({
            description: "Walk the dog then show him some code on github."
        })
    }).then((todo)=> {
        console.log(`Created todo: ${todo.description}`);
        return Todo.create({
            description: "Learn to code",
            completed: true
        })
    }).then((todo)=> {
        console.log(`Created todo: ${todo.description}`);
    }).then(()=>{
        return Todo.findById(1)
    }).then((todo)=>{
        todo ? console.log(todo.toJSON()) : console.log("No todo found.")
    }).then(()=>{
        return Todo.findAll({where: {description: {
            //Search for 'code' in all todos, it's like indexOf('code')
            //This will return two matches
            $like: "%code%"
        }}})
    }).then((todos)=>{
        todos.forEach((todo)=>{console.log(todo.toJSON())});
    }).catch((e)=> {
        console.log(e);
    })
});


