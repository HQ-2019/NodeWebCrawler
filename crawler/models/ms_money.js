/* jshint indent: 2 */
/*
 * 使用sequelize-auto自动生成model
 * 执行sequelize-auto -o "../models" -d holmes -t ms_money -h 10.10.232.242 -u username -p 3306 -x 'password'
 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ms_money', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    period_code: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    period_name: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    money_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    money_name: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    price: {
      type: "DOUBLE(10,0)",
      allowNull: false
    },
    money_content: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    thumbnail_url: {
      type: DataTypes.STRING(1024),
      allowNull: false
    },
    detail_url: {
      type: DataTypes.STRING(1024),
      allowNull: false
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    update_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'ms_money'
  });
};
