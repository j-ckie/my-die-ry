'use strict';
module.exports = (sequelize, DataTypes) => {
  const Death = sequelize.define('Death', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    type: DataTypes.STRING
  }, {});
  Death.associate = function(models) {
    // associations can be defined here
  };
  return Death;
};