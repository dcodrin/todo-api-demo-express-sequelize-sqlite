var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var PORT = process.env.PORT || 3000;
var db = require("./db.js");
var bcrypt = require("bcrypt");
//Since our middleware is a function that takes a db variable we are passing the db right here.
var middleware = require("./middleware.js")(db);

//Use bodyParser to parse data
app.use(bodyParser.json());
//Our root
app.get("/", (req, res)=> {
    res.send("Todo API Root");
});
//GET /todos all todos
app.get("/todos",middleware.requireAuthentication, (req, res)=> {
    //Use the built-in .json() method to send back our data in JSON format.
    var query = req.query;
    var where = {};
    //Only getting the todos associated with the logged in user
    where.userId = req.user.id;
    //We are building our query object based on the query params
    if (query.completed) {
        where.completed = query.completed === "true" ? true : false
    }
    if (query.description) {
        where.description = {
            $like: `%${query.description}%`
        }
    }
    //We retrieve the todos based on our query object
    db.todo.findAll({where: where}).then((todos)=> {
        todos.length > 0 ? res.json(todos) : res.status(404).send("No matches found");
    }).catch((e)=> {
        return res.json(e);
    })
});
//GET /todos/:id get individual todo
app.get("/todos/:id",middleware.requireAuthentication, (req, res)=> {
    //Use sequelize findOne to retrieve a match. Notice we check for userId.
    db.todo.findOne({where: {userId: req.user.id, id: Number(req.params.id)}}).then((todo)=> {
        todo ? res.json(todo) : res.status(404).send("Todo not found.")
    }).catch((e)=> {
        return res.json(e);
    })
});
//POST /todos new todo
app.post("/todos", middleware.requireAuthentication, (req, res)=> {

    var newTodo = {};

    if (req.body.description) {
        newTodo.description = req.body.description
    }
    if (req.body.completed) {
        newTodo.completed = req.body.completed
    }
    req.user.createTodo(newTodo).then((todo)=>{
        res.json(todo);
    }).catch((e)=>{
        res.json(e);
    })

});
//DELETE /todos/:id delete todo by id
app.delete("/todos/:id",middleware.requireAuthentication, (req, res)=> {
    db.todo.destroy({
        where: {
            userId: req.user.id,
            id: Number(req.params.id)
        }
    }).then((rowsDeleted)=> {
        if (rowsDeleted === 0) {
            res.status(404).send("No match found.")
        } else {
            res.status(204).send("Todo deleted.")
        }
    }).catch((e)=> {
        res.json(e);
    })
});
//PUT /todos/id
app.put("/todos/:id",middleware.requireAuthentication, (req, res)=> {
    var update = {};
    console.log(req.user.id)
    if (req.body.description) {
        update.description = req.body.description
    }
    if (req.body.completed) {
        update.completed = req.body.completed
    }
    db.todo.findOne({where: {
        id: Number(req.params.id),
        userId: req.user.id
    }})
        .then((todo)=> {
            if (todo) {
                return todo.update(update)
            } else {
                return res.status(404).send("No match found.")
            }
            //Notice how we pass a second argument to our then() call
        }, ()=> {
            res.status(500).send();
        }).then((todo)=> {
        res.json(todo.toJSON());
    }, (e)=> {
        res.status(400).json(e);
    })
});
//POST /users/
app.post("/users", (req, res)=> {
    var newUser = {};
    //Create new user only with the email and password fields
    if (req.body.email) {
        newUser.email = req.body.email
    }
    if (req.body.password) {
        newUser.password = req.body.password
    }
    db.user.create(newUser).then((user)=> {
        //We use user.toPublicJSON which was defined in user.js to only send back specific data. toPublicJSON() is a
        // function created under the instanceMethods of the user model.
        return res.json(user.toPublicJSON());
    }).catch((e)=> {
        return res.status(400).json(e);
    });
});

//POST /users/login
app.post("/users/login", (req, res)=> {
    var loginUser = {};
    if (typeof req.body.email === "string") {
        loginUser.email = req.body.email
    }
    if (typeof req.body.password === "string") {
        loginUser.password = req.body.password
    }
    db.user.authentication(loginUser).then((user)=> {
        //The token will be sent in the header.
        var token = user.generateToken("authentication");

        if (token) {
            res.header("Auth", token).json(user.toPublicJSON());
        } else {
            return res.status(401).send("Authentication failed.")
        }
    }, ()=> {
        res.status(401).send("Authentication failed.")
    });
});
//When creating new associations you have to recreate the database tables
db.sequelize.sync({force: true}).then(()=> {
    app.listen(PORT, ()=> {
        console.log(`Express listening on port ${PORT}`)
    });
});