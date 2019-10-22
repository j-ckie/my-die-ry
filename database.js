const express = require('express'),
  app = express(),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  Sequelize = require('sequelize'),
  bcrypt = require('bcrypt'),
  // Op = Sequelize.Op,
  models = require('./models'),
  SALT_ROUNDS = 10,
  PORT = process.env.PORT || 8080;

// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended: false}))
// app.set('view engine', 'pug')