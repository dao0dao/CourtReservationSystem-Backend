import process from 'process';
//Ustawienie zmiennych
import { setVariables } from './varibles';
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
import Coaches from './models/admin';
import Players from './models/players';
import Opponents from './models/opponents';
import Account from './models/account';
import Payments from './models/payments';
import PriceList from './models/priceList';

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

Coaches.hasMany(Payments, { as: 'coachesId', onDelete: 'NO ACTION' });
Players.hasOne(Account, { onDelete: 'CASCADE' });
Players.hasMany(Payments, { onDelete: 'CASCADE' });
Players.hasMany(Opponents, { onDelete: 'CASCADE' });
// Players.belongsTo(PriceList, { onDelete: 'SET NULL', allowNull: true });

writeUnhandledErrorToLog();

if (process.env.MODE === 'DEV') {
    /* Lokalny dostęp */
    const server = http.createServer(app);
    server.listen(port, () => {
        console.log(`-----Stworzono serwer na: http://localhost:${port} -----`);
        connectToBase();
        //czyszczenie plików sesyjnych co godzinę
        clearSessionFolder();
        setInterval(() => {
            clearSessionFolder();
        }, 60 * 60 * 1000);
    });
}

if (process.env.MODE !== 'DEV') {
    /* Zdalny dostęp */
    const server = https.createServer({ key: privateKey, cert: certificate }, app);
    server.listen(port, () => {
        console.log(`-----Stworzono serwer na: http://localhost:${port} -----`);
        connectToBase();
        //czyszczenie plików sesyjnych co godzinę
        clearSessionFolder();
        setInterval(() => {
            clearSessionFolder();
        }, 60 * 60 * 1000);
    });
    //Ponowne uruchomienie po nieobsłużonym błędzie w trybie PRODUCTION
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