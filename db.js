const Sequelize = require('sequelize');
const UserModel = require('./models/user.js');
const TransactionModel = require('./models/transaction.js');

let db;
// PRODUCTION or Locally running backend through PROXY
if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'proxy'){console.log('IN PROD');
  db = new Sequelize(process.env.SQL_DATABASE, 'brysonkruk', process.env.SQL_PASSWORD, {
    dialect: 'postgres',
    protocol: 'postgres',
    storage: "./session.postgres",
    operatorsAliases: false,
    //dialectOptions : { ssl: true },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  });

  // To connect with unix sockets, set the instance connection name found in the google cloud console
  //if(process.env.NODE_ENV === 'proxy' && process.env.INSTANCE_CONNECTION_NAME) {
    //db.host = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
    db.host = `/cloudsql/dcoin-web-app:us-central1:dcoin-user-db`;
  //}
  
// DEVELOPMENT
}else{
  const sequelizeSettings = {
    dialect: 'postgres',
    protocol: 'postgres',
    storage: "./session.postgres",
    operatorsAliases: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
  const dbUrl = "postgres://admin:admin@localhost/dcoin";
  db = new Sequelize(dbUrl, sequelizeSettings);
}

db.sync();


const User = UserModel(db, Sequelize);
const Transaction = TransactionModel(db, Sequelize);


module.exports = { User, Transaction, db }