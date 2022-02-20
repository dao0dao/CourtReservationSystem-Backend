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
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
    },
    court: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    priceSummer: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    priceWinter: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    stringsName: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
    },
    tension: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
    },
    balls: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
    },
    weeks: {
        type: Sequelize.DataTypes.JSON,
        allowNull: true,
    },
    notes: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
    },
});
sequelize.createSchema('players', { ifNotExists: true });
export default Players;