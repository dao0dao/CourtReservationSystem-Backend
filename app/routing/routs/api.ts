import authorization from './api/authorization';
import users from './api/users';
import players from './api/players';
import reservations from './api/reservation';
import priceList from './api/priceList';
import serviceList from './api/services';

const api = [
    authorization,
    users,
    players,
    reservations,
    priceList,
    serviceList
];
export default api;