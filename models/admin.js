"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Sequelize = require('sequelize').Sequelize;
var database_1 = __importDefault(require("../utils/database"));
var Coach = database_1.default.define('coaches', {
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
exports.default = Coach;
