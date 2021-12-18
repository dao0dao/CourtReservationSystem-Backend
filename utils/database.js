"use strict";
exports.__esModule = true;
var Sequelize = require('sequelize').Sequelize;
var sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USERNAME, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: process.env.MYSQL_DIALECT
});
exports["default"] = sequelize;
