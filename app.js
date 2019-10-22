const express = require("express");
const port = process.env.PORT || 8080;
const cors= require('cors');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize'); 
const bcrypt = require('bcrypt');
const models = require('./models');
const app = express();
const json = require('./config/config.json');

const devSequelize = new Sequelize(json.development.database, json.development.username, json.development.password, {
  host: json.development.host, //reference config file for settings
  dialect: json.development.dialect 
});
//pulled directly from https://sequelize.org/v5/manual/getting-started.html#setting-up-a-connection 

devSequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

console.log(devSequelize.tables);
  //https://sequelize.org/v5/manual/getting-started.html#setting-up-a-connection
  


app.set ("view engine", "pug");
app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.render("index", {message: "Hey!"});
});
app.get("/register", (req, res)=>{
    res.render("register");
});
app.get("/login", (req, res)=>{
    res.render("login");
});





app.listen(port, ()=> {
    console.log(`port ${port} is running`);
});