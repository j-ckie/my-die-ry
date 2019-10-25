'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn(
        'Deaths',
        ['title'],
        {
          type: Sequelize.STRING,
          allowNull: false,
        }
      ),
      queryInterface.changeColumn(
        'Deaths',
        ['description'],
        {
          type: Sequelize.TEXT,
          allowNull: false,
        }
      ),
    ])
  },   

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('Death', ['title'], {allowNull: true}),
      queryInterface.changeColumn('Death', ['description'], {allowNull: true}),
    ])
  }
}