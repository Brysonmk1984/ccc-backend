const TransactionModel = function(db, DataTypes){
  const Transaction = db.define('Transactions', {
    sender : {
      type : DataTypes.CHAR,
      validate : {
        notEmpty :true
      }
    },
    receiver : {
      type : DataTypes.CHAR,
      validate : {
        notEmpty :true
      }
    },
    transactionHash : {
      type : DataTypes.CHAR,
      unique : true,
      validate : {
        notEmpty :true
      }
    }
  });
  return Transaction;
};

module.exports = TransactionModel ;