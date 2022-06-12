const { Sequelize } = require('sequelize');
import sequelize from "../utils/database";

const Coaches = sequelize.define('coaches', {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Użytkownik'
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
    }
});
sequelize.createSchema('coaches', { ifNotExists: true });
export default Coaches;