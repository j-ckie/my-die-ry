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

// const op = Sequelize.Op;
// var count = 0;

const SALT_ROUNDS = 10;


const devSequelize = new Sequelize(json.development.database, json.development.username, json.development.password, {
  host: json.development.host, //reference config file for settings
  dialect: json.development.dialect,
  pool: {
    max: 1,
    min: 0,
    acquire: 15000,
    idle: 5000 // will close a connection if idle for 5 seconds ??
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
  },
  history: {
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



//   Death.findOne({ order: 'random()' }).then((encounter) => {
//     console.log('#######THIS IS A THING', encounter);
// });
  // devSequelize.sync();
  // Death.findAndCountAll({
  //   where: {
  //     id: {[op.gte]: 1} //OP means OPeration GTE is Greater Than Equal to. see https://sequelize.org/v5/manual/models-usage.html#-code-find--code----search-for-one-specific-element-in-the-database for explanation
  //   }
  // }).then(result => {
  //   count = result.count; // use this to determine table size
  //   var randomDeathID = Math.floor(Math.random() * count) + 1;
  //   console.log("##########LOOK HERE!!!! randomdeathid:",randomDeathID);
  //   // notes: do another find thing with the randomDeathID to spit out the death and death title
  // });
// }




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

app.get("/add", async (req, res) => {
  let keys = []
  let data = {};
  //Retrieve all deaths from database
  let deathData = await models.Death.findAll();
  //Loop over returned data and put only types into keys
  deathData.forEach (function(death) {
    keys.push(death.type)
  })
  //Filter out duplicate keys
  let filteredKeys = [...new Set(keys)]
  //Set data to the filtered keys
  data.types = filteredKeys;
  //Send data and render page with it
  res.render("add", data);
})

app.post('/addDeath', (req, res) => {
  models.Death.create({
      title: req.body.title,
      dead: req.body.dead,
      type: req.body.type 
  }).then(function(death) {
      console.log('Death saved!')
  })
  res.redirect('/account');
})

app.use(
    session({
        secret:"Somehting secret",
        resave: false,
        saveUninitialized: true
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
        console.log("DBuSER PASSWORD: " + dbUser.password)
        if(!dbUser)throw new Error('Login failed');

        bcrypt.compare(req.body.password, dbUser.password,(err, same)=>{
            if(err) throw err;
            if(!same) throw new Error('Incorrect password');
            req.session.user = dbUser;
            res.redirect("/account");
        });
        
    }catch(e){
        res.send(e);
    }

});
app.get ("/account", (req,res)=>{
let data = {};
console.log("this is our account page! ###########################")
// console.log(req.session)
    // data.users = await models.User.findUsername();
    console.log(req.session.user)
    res.render("account", {data: req.session.user.username});
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

// THIS IS mY swamp IM TESTING AAAAH
app.post('/randomDeath', (req,res) => {
  let data = {};
  let deathTitle = {};
  let deathDesc = {};
  let deathType = {};

  // solution from https://stackoverflow.com/questions/42146200/selecting-a-random-record-from-sequelize-findall
  Death.findOne({ // why the fuck is it findOne and not findAll??
    order: Sequelize.literal('rand()'),
    //limit: 1, //NO LIMITS ON THE ONE
  }).then(table => {
  //console.log("Title is:", table.get("title"));
    var title = table.get("title");
    var desc = table.get("description");
    var type = table.get("type");
    var id = table.get("id");
    //var hist = table.get("history");  // get current user history data??
      // append table.get("id") to history data value
      // update user table with new history value
    User.findOne({ 
      where: {
        email: req.session.user.email
      }
      //attributes: ['id', ['history']] 
      //https://sequelize.org/master/manual/models-usage.html OH okay ty
    })
    .then((user) =>{
      if(user){
        //var str = "15,12,44,53"; // example test "deathHistory" until column is there 
        var str = user.get("history"); //str should be "history"
        console.log("history is:", str); //why is history your email address why do you need email in the first place...??

        if (str == undefined) { 
          //var history = [];
          var history = id; 
          
        } else {
          var history = str.split(",").map(Number); //
          history.push(id);
          console.log("str is not NaN");  //this went through
        }

      }
        //[15,12,44,32] << push to end new number
         //push current ID to end of history
        //console.log("history = ", history); //log the new ID on the end
        //[15,12,44,32,5] //new 'deathHistory' to add back to db
        //when looking up history, pull array and then search deathTable for those IDs
        //user.update({
          
          //deathHistory: history //<< update history with NEW version of history
        //});
      } 
    );
    //pass death to displayDeath
    res.render("account", {data: req.session.user.username,deathTitle: title, deathDesc: desc, deathType: type});
  });
});

app.listen(port, ()=> {
    console.log(`port ${port} is running`);
});

