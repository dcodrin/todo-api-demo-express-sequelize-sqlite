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

//sequelize.import allows us to load models from different files.
//this is good for keeping the application organized
db.todo = sequelize.import(__dirname + "/models/todo.js");
db.user = sequelize.import(__dirname + "/models/user.js");
db.token = sequelize.import(__dirname + "/models/token.js");
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;