const Sequelize = require('sequelize');
const UserModel = require('./models/user.js');
const TransactionModel = require('./models/transaction.js');

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
if(process.env.NODE_ENV === 'production'){
  sequelizeSettings.dialectOptions = {
    ssl: true
  }
}


const dbUrl = process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : "postgres://admin:admin@localhost/dcoin";
const db = new Sequelize(dbUrl, sequelizeSettings);
db.sync();


const User = UserModel(db, Sequelize);
const Transaction = TransactionModel(db, Sequelize);


module.exports = { User, Transaction, db }