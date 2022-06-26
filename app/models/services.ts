const { Sequelize } = require('sequelize');
import sequelize from "../utils/database";

const Services = sequelize.define('services', {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    cost: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    }
});
sequelize.createSchema('services', { ifNotExists: true });
export default Services;