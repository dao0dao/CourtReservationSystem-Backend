const { Sequelize } = require('sequelize');
import sequelize from "../utils/database";

const Opponents = sequelize.define('opponents', {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    opponentId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
    },
});
sequelize.createSchema('opponents', { ifNotExists: true });

export default Opponents;