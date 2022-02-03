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
    account: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
    },
    priceSummer: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
    },
    priceWinter: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
    },
    court: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
    },
    strings: {
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
        type: Sequelize.DataTypes.STRING(1234),
        allowNull: true,
    },
    opponents: {
        type: Sequelize.DataTypes.STRING(1234),
        allowNull: true,
    },
    notes: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
    },
});
// sequelize.createSchema('players', { ifNotExists: true });
export default Players;