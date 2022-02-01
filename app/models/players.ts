const { Sequelize } = require('sequelize');
import sequelize from "../utils/database";

const Players = sequelize.define('players', {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
    },
    surname: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
    },
    telephone: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.DataTypes.STRING
    },
    account: {
        type: Sequelize.DataTypes.STRING
    },
    priceSummer: {
        type: Sequelize.DataTypes.STRING
    },
    priceWinter: {
        type: Sequelize.DataTypes.STRING
    },
    court: {
        type: Sequelize.DataTypes.INTEGER
    },
    strings: {
        type: Sequelize.DataTypes.STRING
    },
    tension: {
        type: Sequelize.DataTypes.INTEGER
    },
    balls: {
        type: Sequelize.DataTypes.STRING
    },
    weeks: {
        type: Sequelize.DataTypes.STRING(1234)
    },
    opponents: {
        type: Sequelize.DataTypes.STRING(1234)
    },
    notes: {
        type: Sequelize.DataTypes.STRING
    },
});

export default Players;