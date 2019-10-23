'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addConstraint(
        'Histories',
        ['userId'],
        {
          type: 'foreign key',
          name: 'constraintUser',
          references: {
            table: 'Users',
            field: 'id'
          }
        }
      ),
      queryInterface.addConstraint(
        'Histories',
        ['deathId'],
        {
          type: 'foreign key',
          name: 'constraintDeath',
          references: {
            table: 'Deaths',
            field: 'id'
          }
        }
      ),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeConstraint('History','constraintUser'),
      queryInterface.removeConstraint('History','constraintDeath'),
    ])
  }
};
