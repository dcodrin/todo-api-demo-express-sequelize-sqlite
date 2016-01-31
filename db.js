var Sequelize = require("sequelize");
//If the code runs on Heroku the env will be set to production else we are setting it to "development". process.env.NODE_ENV === "production" if on Heroku.
var env = process.env.NODE_ENV || "development";

//If we are on Heroku then access the postgres database, else the sqlite one.
var sequelize;
if (env === "production") {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        "dialect": "postgres"
    });
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {
        "dialect": "sqlite",
        "storage": __dirname + "/data/dev-todo-api.sqlite"
    });
}

var db = {};

db.todo = sequelize.import(__dirname + "/models/todo.js");
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;