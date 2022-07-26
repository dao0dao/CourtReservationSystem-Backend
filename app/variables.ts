import { env } from 'process';

export const setVariables = () => {
        env.PORT = '3000'; //port on which server will start
        env.MYSQL_DATABASE = ""; //Data base name
        env.MYSQL_USERNAME = ""; // user name in sql base
        env.MYSQL_PASSWORD = ""; // user password
        env.MYSQL_HOST = ""; //host
        env.MYSQL_DIALECT = "mysql";
};