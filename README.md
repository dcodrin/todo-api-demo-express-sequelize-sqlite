This is a basic demo of an express server using sequelize.

Our database is initiated in db.js. The todo model is imported into db.js from todo.js.

To use heroku postgres run this in the terminal:

heroku addons:create heroku-postgresql:hobby-dev

Install: 

npm install pg
npm install pg-hstore