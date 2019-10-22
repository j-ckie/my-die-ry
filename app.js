const express = require("express");
const port = process.env.PORT || 8080;
const cors= require('cors');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt')
const models = require('./models');
const app = express();

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