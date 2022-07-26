import { env } from 'process';

export const setVariables = () => {
        env.PORT = '3000';
        env.MYSQL_DATABASE = ""; //Database name
        env.MYSQL_USERNAME = ""; // user name in sql database
        env.MYSQL_PASSWORD = ""; // user password in sql database
        env.MYSQL_HOST = "localhost";
        env.MYSQL_DIALECT = "mysql";
};