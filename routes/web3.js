
const express = require('express');
const web3 = require('web3');
const router = express.Router(); 

const web3js = new web3(new web3.providers.HttpProvider("http://52.15.122.19:8111"));


// POST - RETRIEVE TRANSACTION DATA OF SUPPLIED ARRAY FROM BLOCKCHAIN
router.post('/retrieve-transaction-data', function(req, res, next){
  const transArray = req.body.transArray;
  const promiseArray = transArray.map((p, i)=>{
    if(i < 10){
      return new Promise((resolve, reject)=>{
        web3js.eth.getTransaction(transArray[i].hash, (err, data) =>{
          if(err){
            console.log('ERR', err);
            reject(err);
          }
          resolve(data);
        });
      });
    }
  });

  Promise.all(promiseArray)
  .then((values) =>{
    const filteredArray = values.filter((v)=>{
      if(v){
        return v;
      };
    });
    res.status(200).send(filteredArray);
    next();
  });
});

// POST - READ BALANCE FROM BLOCKCHAIN
router.post('/read-balance', function(req, res, next){
  web3js.eth.getBalance(req.body.publicEthKey, (error, wei)=>{
    if (!error) {
      const weiBalance = web3.utils.toBN(wei);
      const ethBalance = web3.utils.fromWei(weiBalance, 'ether');
      res.status(200).send(ethBalance);
      next();
    }else{console.log('Error retrieving Balance data',error);
      res.send(error);
      next();
    }
  });
});

module.exports = router;