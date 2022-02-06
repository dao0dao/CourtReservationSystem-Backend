const { Sequelize } = require('sequelize');
import sequelize from "../utils/database";

const Payments = sequelize.define('payments', {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    value: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    service: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    }
});
sequelize.createSchema('payments', { ifNotExists: true });
export default Payments;