const express = require("express");
const port = process.env.PORT || 8080;
const cors= require('cors');
const bodyParser = require('body-parser');
const session = require("express-session");
const Sequelize = require('sequelize'); // ok so you imported 'sequelize'. now you gotta tell it how to connect to the elephant thing ok
const bcrypt = require('bcrypt');
const models = require('./models');
const app = express();
const json = require('./config/config.json');
const SALT_ROUNDS = 10;

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
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

app.get("/",(req,res)=>{
    res.render("index", {message: "Hey!"});
});
app.get("/register", (req, res)=>{
    res.render("register");
});
app.get("/login", (req, res)=>{
    res.render("login");
});
app.use(
    session({
        secret:"Somehting secret",
        resave: false,
        saveUnitialized: true
    })
);

app.post('/loginUser', async(req,res)=>{
    try{
        let email = req.body.email
        let dbUser = await models.User.findOne({
            where: { 
                email: email
            }
        });
        console.log(dbUser)
        console.log("PASSWORD OVER HERE: " + req.body.password)
        console.log("DBUSER PASSWORD: " + dbUser.password)
        if(!dbUser)throw new Error('Login failed');

        bcrypt.compare(req.body.password, dbUser.password,(err, same)=>{
            if(err) throw err;
            if(!same) throw new Error('Incorrect password');
            req.session.user = dbUser;
            res.render("account");
        });

        
    }catch(e){
        res.send(e);
    }
 
});




app.post('/registerUser', (req,res) => {
    console.log(req.body)
    models.User.findOne({
        where: { 
            email: req.body.email
        }
    }).then((user) =>{
        if(user){
            // res.status(500).json({message: 'email already exists'})
                res.render("login", {status:500, message: 'email already exists'})
        }   else {
            bcrypt.hash(req.body.password, SALT_ROUNDS, function(error, hash) {
                if(error ==null) {
                    let user = models.User.build({
                        username: req.body.username,
                        email: req.body.email,
                        password: hash
            })
            user.save()
            res.redirect('/login');
            }
        })
        }
    })
})



app.listen(port, ()=> {
    console.log(`port ${port} is running`);
});