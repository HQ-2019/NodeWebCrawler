/**
 * 数据库执行操作
 * Created by huangqun on 2017/12/18.
 */

const db = require('../config/dbConfig')
const  moneyModel = require('../models/ms_test_money')
const moneyDB = db.moneyDB // 引入数据库
console.log(moneyDB)
const moneyInfo = moneyDB.import(moneyModel) // 用sequelize的import方法引入表结构。

const insertItem = async function (item) {
  await moneyInfo.create({
    period_code: item.periodCode,
    period_name: item.periodName,
    money_id: item.moneyCode,
    money_name: item.moneyName,
    money_content: item.moneyContent,
    thumbnail_url: item.moneyThumbnailUrl,
    detail_url: item.moneyDetailUrl,
    price: 0,
    create_time: new Date(),
    update_time: new Date()
  })
  return true
}

module.exports = {
  insertItem
}