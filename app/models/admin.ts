const { Sequelize } = require('sequelize');
import sequelize from "../utils/database";

const Coach = sequelize.define('coaches', {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    login: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
    },
    isAdmin: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
    },
    canAddDeleteAdmin: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
    },
    canAddDeletePlayers: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
    },
    canEditPlayers: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
    },
    canEditSchedule: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
    },
    canTakeFees: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
    },
    accessToStatics: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
    },
});

export default Coach;