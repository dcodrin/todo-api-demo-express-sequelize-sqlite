var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var PORT = process.env.PORT || 3000;
var db = require("./db.js");

//Use bodyParser to parse data
app.use(bodyParser.json());
//Our root
app.get("/", (req, res)=> {
    res.send("Todo API Root");
});
//GET /todos all todos
app.get("/todos", (req, res)=> {
    //Use the built-in .json() method to send back our data in JSON format.
    var query = req.query;
    var where = {};
    if(query.completed){
        where.completed = query.completed === "true" ? true : false
    }
    if(query.description){
        where.description = {
            $like: `%${query.description}%`
        }
    }
    db.todo.findAll({where: where}).then((todos)=>{
        todos.length > 0 ? res.json(todos) : res.status(404).send("No matches found");
    }).catch((e)=>{
        return res.json(e);
    })
});
//GET /todos/:id get individual todo
app.get("/todos/:id", (req, res)=> {
    //Use sequelize findById to retrieve a match
    db.todo.findById(Number(req.params.id)).then((todo)=>{
        todo ? res.json(todo) : res.status(404).send("Todo not found.")
    }).catch((e)=>{
        return res.json(e);
    })
});
//POST /todos new todo
app.post("/todos", (req, res)=> {
    db.todo.create({
        description: req.body.description ? req.body.description.trim() : null,
        completed: req.body.completed ? req.body.completed : false
    }).then((todo)=> {
        return res.json(todo);
    }).catch((e)=> {
        return res.status(400).json(e);
    });

});
//DELETE /todos/:id delete todo by id
app.delete("/todos/:id", (req, res)=> {

    db.todo.destroy({
        where: {
            id: Number(req.params.id)
        }
    }).then((rowsDeleted)=>{
        if(rowsDeleted === 0){
            res.status(404).send("No match found.")
        } else {
            res.status(204).send("Todo deleted.")
        }
    }).catch((e)=>{
        res.json(e);
    })

});
//PUT /todos/id
app.put("/todos/:id", (req, res)=> {
    //Data validation;
    var validAttributes = {};
    if (req.body.hasOwnProperty("completed") && typeof req.body.completed === "boolean") {
        validAttributes.completed = req.body.completed;
    } else if (req.body.hasOwnProperty("completed")) {
        return res.status(400).send("Please make sure 'completed' field is a boolean.")
    }
    if (req.body.hasOwnProperty("description") && typeof req.body.description === "string" && req.body.description.trim().length > 0) {
        validAttributes.description = req.body.description
    } else if (req.body.hasOwnProperty("description")) {
        return res.status(400).send("Please make sure 'description' field is a string.")
    }
    //Updating todo
    //First find a match by id
    var matched;
    todos.forEach((todo)=> {
        todo.id === Number(req.params.id) ? matched = todo : null;
    });
    //If match found
    if (matched) {
        for (var prop1 in validAttributes) {
            if (matched.hasOwnProperty(prop1)) {
                if (prop1 === "description") {
                    //Check for description and trim it
                    matched[prop1] = validAttributes[prop1].trim()
                } else matched[prop1] = validAttributes[prop1];
            }
        }
    }
    matched ? res.json(matched) : res.status(404).send("No match found.");

});

db.sequelize.sync().then(()=> {
    app.listen(PORT, ()=> {
        console.log(`Express listening on port ${PORT}`)
    });
});