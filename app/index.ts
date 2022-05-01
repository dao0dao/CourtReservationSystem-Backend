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
import createFile from './utils/createFile';
//Rout
import rootRout from './routing/routs/root';
import auth from './routing/routs/api/authorization';
import user from './routing/routs/api/users';
import players from './routing/routs/api/players';
import reservation from './routing/routs/api/reservation';
// Modele tabel
import Coaches from './models/admin';
import Players from './models/players';
import Opponents from './models/opponents';
import Account from './models/account';
import Payments from './models/payments';

import { creatPassword } from './utils/bcrypt';
import writeUnhandledErrorToLog from './unhandledErrors';


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


app.use('/api', auth);
app.use('/api', user);
app.use('/api', players);
app.use('/api', reservation);
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

writeUnhandledErrorToLog();

if (process.env.MODE === 'DEV') {
    /* Lokalny dostęp */
    const server = http.createServer(app);
    server.listen(port, () => {
        console.log(`-----Stworzono serwer na: http://localhost:${port} -----`);
        connectToBase();
    });
}

if (process.env.MODE !== 'DEV') {
    /* Zdalny dostęp */
    const server = https.createServer({ key: privateKey, cert: certificate }, app);
    server.listen(port, () => {
        console.log(`-----Stworzono serwer na: http://localhost:${port} -----`);
        connectToBase();
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
