// Moduły
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Pliki
import sequelize from './utils/database';


const app = express();
const port = process.env.PORT || 3000;

if (process.env.DevMode) {
    app.use(cors());
}

app.use(express.urlencoded({ extends: true }));
app.use(cookieParser());
app.use(express.json());

const connectToBase = () => {
    sequelize.sync({ alert: true })
        .then(() => { console.log('-----Połączono z bazą danych-----'); })
        .catch((err: Error) => {
            console.log('-----Nieudane połączenie z bazą danych, ponowna próba za 1 min-----');
            setTimeout(() => {
                connectToBase();
            }, 60000);
        });
};

app.listen(port, () => {
    console.log(`-----Stworzono serwer na: http://localhost:${port} -----`);
    connectToBase();
});