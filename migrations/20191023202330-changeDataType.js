'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      'Deaths',
      'description',
      {
        type: Sequelize.TEXT
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      'Deaths', 
      'description',
      {
        type: Sequelize.STRING
      }
    )
  }
};
