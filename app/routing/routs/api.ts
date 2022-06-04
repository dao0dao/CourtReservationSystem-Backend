import authorization from './api/authorization';
import users from './api/users';
import players from './api/players';
import reservations from './api/reservation';
import priceList from './api/priceList';

const api = [
    authorization,
    users,
    players,
    reservations,
    priceList
];
export default api;