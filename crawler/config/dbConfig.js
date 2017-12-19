/**
 * Created by huangqun on 2017/12/18.
 */
const Sequelize = require('sequelize');

// 使用URI形式连接
const moneyDB = new Sequelize('mysql://username:puhui@10.10.232.242:3306/holmes', {
  define: {
    timestamps: false // 取消Sequelzie自动给数据表加入时间戳（created以及updated）
  }
})

module.exports = {
  moneyDB
}