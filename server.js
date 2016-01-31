var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

//Use bodyParser to parse data
app.use(bodyParser.json());
//Our root
app.get("/", (req, res)=> {
    res.send("Todo API Root");
});
//GET /todos all todos
app.get("/todos", (req, res)=> {
    //Use the built-in .json() method to send back our data in JSON format.
    //If query parameters are passed do a check for what they are and filter the results accordingly
    var queryParams = req.query;
    var filteredTodos = todos.filter((todo)=> {

        var checkCompleted = false;
        var checkDescription = false;
        //Iterate over all queries.
        for (prop in queryParams) {

            if (prop === "completed") {
                if (todo.hasOwnProperty(prop) && todo[prop].toString() === queryParams[prop]) {
                    checkCompleted = true;
                }
            }
            if (prop === "description") {
                if (todo.hasOwnProperty(prop) && todo[prop].toLowerCase().indexOf(queryParams[prop].toLowerCase()) > -1) {
                    checkDescription = true;
                }
            }
        }

        //Use Object.keys() to find out how many queries. If single query run one check if multiple queries run
        // different check.

        if (Object.keys(queryParams).length > 1) {
            if (checkCompleted && checkDescription) {
                return true;
            }
        } else if (Object.keys(queryParams).length < 2) {
            if (checkCompleted || checkDescription) {
                return true;
            }
        } else {
            return false;
        }

    });

    //Check to see filtered if filtered todos should be returned or all todos. If the filtered todos list is empty
    // inform the user.

    if (filteredTodos.length > 0 || Object.keys(queryParams).length > 0) {
        if (filteredTodos.length < 1) {
            return res.status(404).send("No matches found.")
        } else {
            return res.json(filteredTodos);
        }
    } else if (todos.length > 0) {
        return res.json(todos);
    } else {
        return res.status(404).send("Todo list is empty")
    }
});
//GET /todos/:id get individual todo
app.get("/todos/:id", (req, res)=> {
    //Using reduce we search for a match.
    var found = todos.reduce((acc, todo)=> {
        return todo.id === Number(req.params.id) ? acc = todo : acc;
    }, false);
    found ? res.json(found) : res.status(404).send("Not match found.");
});
//POST /todos new todo
app.post("/todos", (req, res)=> {
    //Do basic data validation
    if (typeof req.body.description === "string" && typeof req.body.completed === "boolean") {
        //Filter data
        var todo = {description: req.body.description, completed: req.body.completed};
        //Trim white spaces from description
        todo.description = todo.description.trim();
        //Add id to each todo
        todo.id = todoNextId++;
        todos.push(todo);
        res.json(todo);
    } else {
        //Send a 400 error which means that bad data was provided
        res.status(400).send("Bad data.");
    }
});
//DELETE /todos/:id delete todo by id
app.delete("/todos/:id", (req, res)=> {
    //Use filter to delete matching todo
    //Aslo return the user the todo that was deleted
    var matched;
    todos = todos.filter((todo)=> {
        todo.id === Number(req.params.id) ? matched = todo : null;
        return todo.id !== Number(req.params.id);
    });
    matched ? res.json(matched) : res.status(404).send("No match found.")
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

app.listen(PORT, ()=> {
    console.log(`Express listening on port ${PORT}`)
});

