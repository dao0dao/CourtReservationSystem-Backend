const { Sequelize } = require('sequelize');
import sequelize from "../utils/database";

const PriceListModel = sequelize.define('priceList', {
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
    hours: {
        type: Sequelize.DataTypes.JSON,
        allowNull: false,
    }
});
sequelize.createSchema('priceList', { ifNotExists: true });
export default PriceListModel;