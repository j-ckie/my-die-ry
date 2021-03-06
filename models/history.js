'use strict';
module.exports = (sequelize, DataTypes) => {
  const History = sequelize.define('History', {
    userId: DataTypes.INTEGER,
    deathId: DataTypes.INTEGER,
    dateDied: DataTypes.DATEONLY
  }, {});
  History.associate = function(models) {
    // History.hasMany(models.Death, {
    //   as: 'deaths',
    //   foreignKey: 'deathId'
    // })
  };
  return History;
};