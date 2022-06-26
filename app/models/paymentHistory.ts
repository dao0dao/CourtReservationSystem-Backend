const { Sequelize } = require('sequelize');
import sequelize from "../utils/database";

const PaymentsHistory = sequelize.define('paymentsHistory', {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    action: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    playerId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false
    },
    playerName: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    serviceName: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    accountBefore: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    accountAfter: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    cashier: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    }

});
sequelize.createSchema('paymentsHistory', { ifNotExists: true });
export default PaymentsHistory;