
const express = require('express');
const web3 = require('web3');
const router = express.Router(); 

const web3js = new web3(new web3.providers.HttpProvider("http://35.237.222.172:8111"));


// POST - RETRIEVE TRANSACTION DATA OF SUPPLIED ARRAY FROM BLOCKCHAIN
router.post('/retrieve-transaction-data', function(req, res, next){

  console.log('TD', transArray);
  const promiseArray = transArray.map((p, i)=>{
    if(i < 10){
      return new Promise((resolve, reject)=>{
        web3js.eth.getTransaction(transArray[i].hash, (err, data) =>{
          if(err){
            console.log('ERR', err);
            reject(err);
          }
          console.log('TRANS DATA', data);
          resolve(data);
        });
      });
    }
  });

  Promise.all(promiseArray)
  .then((values) =>{
    // Was receiving undefined occasionally... need to look into this later
    // In the mean time, just don't show them
    const filteredArray = values.filter((v)=>{
      return typeof v !== 'undefined';
    });

    res.status(200).send(filteredArray);
    next();
  });
});

// POST - READ BALANCE FROM BLOCKCHAIN
router.post('/read-balance', function(req, res, next){
  web3js.eth.getBalance(req.body.publicEthKey, (error, wei)=>{
    console.log('inside callback for getBalance, before conditional');
    if (!error) {console.log('bal');
      const weiBalance = web3.utils.toBN(wei);
      const ethBalance = web3.utils.fromWei(weiBalance, 'ether');
      console.log(ethBalance);
      res.status(200).send(ethBalance);
      next();
    }else{console.log('Error retrieving Balance data',error);
      next(error);
    }
  });
});

module.exports = router;