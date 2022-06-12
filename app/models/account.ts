const { Sequelize } = require('sequelize');
import sequelize from "../utils/database";

const Account = sequelize.define('account', {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    account: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    }
});
sequelize.createSchema('account', { ifNotExists: true });
export default Account;