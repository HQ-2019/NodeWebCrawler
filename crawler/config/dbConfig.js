/**
 * Created by huangqun on 2017/12/18.
 */
// https://itbilu.com/nodejs/npm/VkYIaRPz-.html#induction-connection

const Sequelize = require('sequelize');

// var sequelize = new Sequelize('database', 'username', 'password', {
//   host: 'localhost',
//   dialect: 'mysql'|'mariadb'|'sqlite'|'postgres'|'mssql',
//   pool: {
//     max: 5,
//     min: 0,
//     idle: 10000
//   }
// });

// 使用URI形式连接
const moneyDB = new Sequelize('mysql://admin_g:puhui@10.10.232.242:3306/kakakaa')

module.exports = {
  moneyDB
}