const { Sequelize } = require('sequelize');
import sequelize from "../utils/database";

const ReservationModel = sequelize.define('reservation', {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    transformY: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
    },
    transformX: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
    },
    ceilHeight: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
    },
    zIndex: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    timeFrom: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    timeTo: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    court: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    playerOneId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    playerTwoId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    guestOne: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    guestTwo: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    hourCount: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
    },
    isPlayerOnePayed: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false
    },
    isPlayerTwoPayed: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false
    },
    isFirstPayment: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: true,
    },

});
sequelize.createSchema('reservation', { ifNotExist: true });
export default ReservationModel;