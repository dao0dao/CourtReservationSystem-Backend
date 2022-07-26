import process from 'process';
//Ustawienie zmiennych
import { setVariables } from './variables';
setVariables();
// Moduły
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { join } = require('path');
import https from 'https';
import http from 'http';
import { readFileSync } from 'fs';
// Utility
import sequelize from './utils/database';
import appDir, { PublicFiles } from './utils/appDir';
//Routs
import rootRout from './routing/routs/root';
import apiRouts from './routing/routs/api';
// Modele tabel
import Players from './models/players';
import Opponents from './models/opponents';
import Account from './models/account';

import { writeUnhandledErrorToLog } from './error_to_log';
import { clearSessionFolder } from './utils/handleSession';

const app = express();
const port = process.env.PORT || 3000;

const privateKey = readFileSync(join(appDir, '..', 'server.key'));
const certificate = readFileSync(join(appDir, '..', 'server.cert'));


if (process.env.MODE === 'DEV') {
    app.use(cors({
        origin: [
            "http://localhost:4200",
            "http://localhost:3000",
        ],
        credentials: true
    }));
}

app.use(cookieParser(['secret', 'thisIsMySecret', 'secretService']));
app.use(express.json());
app.use(express.static(PublicFiles));


app.use('/api', apiRouts);
app.use(rootRout);

const connectToBase = () => {
    sequelize.sync({ alert: true })
        .then(() => { console.log('-----Połączono z bazą danych-----'); })
        .catch((err: Error) => {
            if (err) {
                console.log('-----Nieudane połączenie z bazą danych, ponowna próba za 1 min-----');
                setTimeout(() => {
                    connectToBase();
                }, 60000);
            }
        });
};

Players.hasOne(Account, { onDelete: 'CASCADE' });
Players.hasMany(Opponents, { onDelete: 'CASCADE' });
writeUnhandledErrorToLog();

if (process.env.MODE === 'DEV') {
    /* Handling Angular ng serve on 4200 */
    const server = http.createServer(app);
    server.listen(port, () => {
        console.log(`-----Stworzono serwer na: http://localhost:${port} -----`);
        connectToBase();
        // clearing session files every one hour
        clearSessionFolder();
        setInterval(() => {
            clearSessionFolder();
        }, 60 * 60 * 1000);
    });
}

if (process.env.MODE !== 'DEV') {
    /* Run on localhost 3000 with angular production */
    const server = https.createServer({ key: privateKey, cert: certificate }, app);
    server.listen(port, () => {
        console.log(`-----Stworzono serwer na: http://localhost:${port} -----`);
        connectToBase();
        // clearing session files every one hour
        clearSessionFolder();
        setInterval(() => {
            clearSessionFolder();
        }, 60 * 60 * 1000);
    });
    /* Restarting server after unhandled crash -- only at production */
    process.on("exit", function () {
        require("child_process").spawn(
            process.argv.shift(),
            process.argv,
            {
                cwd: process.cwd(),
                detached: true,
                stdio: "inherit"
            }
        );

    });
}