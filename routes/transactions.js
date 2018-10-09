
const express = require('express');
const router = express.Router(); 
const Transaction = require('../db').Transaction;
const db = require('../db').db;

// POST - RETRIEVE SENT TRANSACTIONS
router.post('/retrieve-sent-hashes', function(req, res, next){
  Transaction.findAll({
    where : {
        sender : req.body.address.toLowerCase()
    },
    attributes:['transactionHash', 'createdAt'],
    order: [['createdAt', 'DESC']]
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
  Transaction.findAll({
    where : {
        receiver : req.body.address.toLowerCase()
    },
    attributes:['transactionHash', 'createdAt'],
    order: [['createdAt', 'DESC']]
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
    Transaction.create({
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