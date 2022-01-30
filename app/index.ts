//Ustawienie zmiennych
import { setVariables } from './varibles';
setVariables();
// Moduły
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { join } = require('path');
// Pliki
import sequelize from './utils/database';
import { PublicFiles } from './utils/appDir';
//Rout
import rootRout from './routing/routs/root';
import auth from './routing/routs/api/authorization';
import user from './routing/routs/api/users';
import players from './routing/routs/api/players';

import { creatPassword } from './utils/bcrypt';

const app = express();
const port = process.env.PORT || 3000;



if (process.env.DevMode) {
    app.use(cors({
        origin: [
            "http://localhost:4200"
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

app.listen(port, () => {
    console.log(`-----Stworzono serwer na: http://localhost:${port} -----`);
    connectToBase();
});