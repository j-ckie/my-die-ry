const express = require("express");
const port = process.env.PORT || 8080;
const cors= require('cors');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize'); // ok so you imported 'sequelize'. now you gotta tell it how to connect to the elephant thing ok
const bcrypt = require('bcrypt');
const models = require('./models');
const app = express();
const json = require('./config/config.json');

const devSequelize = new Sequelize(json.development.database, json.development.username, json.development.password, {
  host: json.development.host, //reference config file for settings
  dialect: json.development.dialect 
}); //this is setting up teh connection to the database. gotta tell sequalize how to talk to it basically. so its pullin info from that config file for password, username, etc
//pulled directly from https://sequelize.org/v5/manual/getting-started.html#setting-up-a-connection 


//test the connection. logs on connection or error ok okay, its working
// devSequelize
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

// console.log(devSequelize.tables);
  //woudl using math.random work here or no...
  //so this is under the database stuffs we just setup. looking through the manual here for what you can do with it okey
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
app.post("")

// test to return first death
// models.Death.findOne().then(function(death){
//   console.log(death)
// })


app.listen(port, ()=> {
    console.log(`port ${port} is running`);
});