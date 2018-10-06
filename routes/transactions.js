
const express = require('express');
const router = express.Router(); 
const Sequelize = require('sequelize');

const TransactionModel = require('../models').TransactionModel;
const dbUrl = process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : "postgres://admin:admin@localhost/dcoin";
const sequelizeSettings = {
    dialect: 'postgres',
    protocol: 'postgres',
    storage: "./session.postgres",
    pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
},
    operatorsAliases: false
}
if(process.env.NODE_ENV === 'production'){
    sequelizeSettings.dialectOptions = {
    ssl: true
  }
}
const db = new Sequelize(dbUrl, sequelizeSettings);
const transaction = TransactionModel(db, Sequelize);
// POST - RETRIEVE SENT TRANSACTIONS
router.post('/retrieve-sent-hashes', function(req, res, next){
  console.log('LOOK', req.body.address);
  transaction.findAll({
  where : {
      sender : req.body.address.toLowerCase()
  },
  attributes:['transactionHash', 'createdAt']
  })
  .then((transactions, error)=>{
      const transArray = transactions.map((t)=>{
          return {hash: t.transactionHash, timestamp: t.createdAt};
      });
      res.status(200).send(transArray);
      next();
  });
});

// POST - RETRIEVE RECEIVED TRANSACTIONS
router.post('/retrieve-received-hashes', function(req, res, next){
    transaction.findAll({
    where : {
        receiver : req.body.address.toLowerCase()
    },
    attributes:['transactionHash', 'createdAt']
    })
    .then((transactions, error)=>{
        const transArray = transactions.map((t)=>{
            return {hash: t.transactionHash, timestamp: t.createdAt};
        });
        res.status(200).send(transArray);
        next();
    });
});

// POST - SAVE NEW TRANSACTION TO DB
router.post('/save-new-hash', function(req, res, next){
    transaction.create({
        sender : req.body.from,
        receiver : req.body.to,
        transactionHash : req.body.hash
    })
    .then((data) =>{
        console.log(data);
        res.status(200).send(data);
        next();
    })
});


module.exports = router;