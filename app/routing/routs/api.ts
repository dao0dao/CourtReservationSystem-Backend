import authorization from './api/authorization';
import users from './api/users';
import players from './api/players';
import reservations from './api/reservation';
import priceList from './api/priceList';
import serviceList from './api/services';
import history from './api/history';

const api = [
    authorization,
    users,
    players,
    reservations,
    priceList,
    serviceList,
    history
];
export default api;