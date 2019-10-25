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

const Histories = devSequelize.define('Histories', { 
  userId: {
    type: Sequelize.STRING,
  },
  deathId: {
    type: Sequelize.STRING,
  },
  dateDied: {
    type: Sequelize.STRING
  }
}, {
  tableName: 'Histories'
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
      description: req.body.description,
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
  //let deathHist = {};

  // solution from https://stackoverflow.com/questions/42146200/selecting-a-random-record-from-sequelize-findall
  let deathFind = Death.findOne({ 
    order: Sequelize.literal('rand()'),
  }).then(table => {

    var deathTitle = table.get("title");
    var deathDesc = table.get("description");
    var deathType = table.get("type");
    var deathID = table.get("id");
   
    //adds death scenario to histories table 
    Histories.create({ 
      userId: req.session.user.id,
      deathId: deathID
      //dateDied: Date.now() // this is causing it to break for some reason
    }).then((death) => {
      console.log('Death saved!'); // :hellmo: it worksnote
      death.save(); 
      
  })
  
    Histories.findAll({ 
    userId: req.session.user.id,
    order: [
      ['createdAt', 'DESC']
    ],
    limit: 5
  }).then(table => {
    var deathHist0 = table[0].get("deathId");
    var deathHist1 = table[1].get("deathId");
    var deathHist2 = table[2].get("deathId");
    var deathHist3 = table[3].get("deathId");
    var deathHist4 = table[4].get("deathId");

    let promDeath0 = Death.findOne({
      where: {
        id: deathHist0
        }
    }).then (data0 => {
      return data0.get("title");
    });

    let promDeath1 = Death.findOne({
      where: {
        id: deathHist1
        }
    }).then (data1 => {
      return data1.get("title");
    });

    let promDeath2 = Death.findOne({
      where: {
        id: deathHist2
        }
    }).then (data2 => {
      return data2.get("title");
    });

    let promDeath3 = Death.findOne({
      where: {
      id: deathHist3
      }
    }).then (data3 => {
      return data3.get("title");
    });

    let promDeath4 = Death.findOne({
      where: {
        id: deathHist4
        }
    }).then (data4 => {
      return data4.get("title");
    });

    let all = Promise.all([promDeath0, promDeath1, promDeath2, promDeath3, promDeath4]);

    all.then(dataAll => {
      var Title1 = dataAll
      let deathHist0 = Title1[0]
      let deathHist1 = Title1[1]
      let deathHist2 = Title1[2]
      let deathHist3 = Title1[3]
      let deathHist4 = Title1[4]


      res.render("account", { data: req.session.user.username, deathTitle: deathTitle, deathDesc: deathDesc, deathType: deathType, deathHist0:deathHist0, deathHist1:deathHist1, deathHist2:deathHist2, deathHist3:deathHist3, deathHist4:deathHist4 });
    });


  });

    // pass death to displayDeath
    // need to pull death ID from death table and render titles in deathHist
    
    
    
  });
});

app.listen(port, ()=> {
    console.log(`port ${port} is running`);
});

