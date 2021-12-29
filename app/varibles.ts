import { env } from 'process';

export const setVariables = () => {
        env.PORT = '3000';
        env.MYSQL_DATABASE = "mojżeszek";
        env.MYSQL_USERNAME = "root";
        env.MYSQL_PASSWORD = "00Sakur@->--";
        env.MYSQL_HOST = "localhost";
        env.MYSQL_DIALECT = "mysql";
        // env.SESSION_EXPIRED = 2 * 3600 * 1000;
};