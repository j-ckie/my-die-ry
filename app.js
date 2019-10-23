const express = require("express");
const port = process.env.PORT || 8080;
const cors= require('cors');
const bodyParser = require('body-parser');
const session = require("express-session");
const Sequelize = require('sequelize'); 
const bcrypt = require('bcrypt');
const models = require('./models');
const app = express();
const json = require('./config/config.json');
const op = Sequelize.Op;
var count = 0;
const SALT_ROUNDS = 10;

const devSequelize = new Sequelize(json.development.database, json.development.username, json.development.password, {
  host: json.development.host, //reference config file for settings
  dialect: json.development.dialect,
  pool: {
    max: 1,
    min: 0,
    acquire: 15000,
    idle: 5000 // will close a connection if idle for 2 seconds ??
  }
});

const testSequelize = new Sequelize(json.test.database, json.test.username, json.test.password, {
  host: json.test.host,
  dialect: json.test.dialect
});

const prodSequelize = new Sequelize(json.production.database, json.production.username, json.production.password, {
  host: json.production.host,
  dialect: json.production.dialect
});
//pulled directly from https://sequelize.org/v5/manual/getting-started.html#setting-up-a-connection 

testSequelize // tests the connection
  .authenticate()
  .then(() => {
    console.log(' testConnection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

devSequelize // tests the connection
.authenticate()
.then(() => {
  console.log('devConnection has been established successfully.');
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});

prodSequelize // tests the connection
  .authenticate()
  .then(() => {
    console.log('prodConnection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// const model = Sequelize.Model;

const User = devSequelize.define('user', {
  // attributes
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING
    // allowNull defaults to true
  },
  password: {
    type: Sequelize.STRING
  }
}, {
  // options
  tableName: 'Users'
});

const Death = devSequelize.define('death', {
  title: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.STRING,
  },
  type: {
    type: Sequelize.STRING,
  }
}, {
  tableName: 'Deaths'
});

devSequelize.sync();

Death.findAndCountAll({
  where: {
    id: {[op.gte]: 1} //OP means OPeration GTE is Greater Than Equal to. see https://sequelize.org/v5/manual/models-usage.html#-code-find--code----search-for-one-specific-element-in-the-database for explanation
  }
}).then(result => {
  count = result.count; // use this to determine table size
  var randomDeathID = Math.floor(Math.random() * count) + 1;
  console.log("##########LOOK HERE!!!! randomdeathid:",randomDeathID);

  // notes: do another find thing with the randomDeathID to spit out the death and death title
});







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

app.post('/registerUser', (req,res) => {
    console.log(req.body)
    models.User.findOne({
        where: { 
            email: req.body.email
        }
    }).then((user) =>{
        if(user){
            res.status(500).json({message: 'email already exists'})
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