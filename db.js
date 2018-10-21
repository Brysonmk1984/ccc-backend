const Sequelize = require('sequelize');
const UserModel = require('./models/user.js');
const TransactionModel = require('./models/transaction.js');

let db;
// PRODUCTION or Locally running backend through PROXY
if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'proxy'){
  db = new Sequelize(process.env.SQL_DATABASE, process.env.SQL_USER, process.env.SQL_PASSWORD, {
    dialect: 'postgres',
    protocol: 'postgres',
    storage: "./session.postgres",
    operatorsAliases: false,
    host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    //dialectOptions : { ssl: true },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  });
  
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