'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Users',
      'history',
      {
        type: Sequelize.INTEGER
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Users',
      'history',
      {
        type: Sequelize.INTEGER
      }
    )
  },
}
