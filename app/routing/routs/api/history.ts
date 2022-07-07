const { Router } = require('express');
import HistoryController from "../../controller/history_controller";
import { Response, NextFunction } from 'express';
import Request from "../../interfaces/request_interfaces";
import { putUser } from "../../../utils/putUser";
const { body, param, cookie, query } = require('express-validator');

const router = new Router();

router.get('/price/balance/account', [
    cookie('sid_').escape(),
    query('playerId').escape()
],
    putUser,
    (req: Request, res: Response, next: NextFunction) => new HistoryController(req, res, next).getPlayerBalance()
);

router.get('/price/balance/history', [
    cookie('sid_').escape(),
    query('playerId').escape(),
    query('dateFrom').escape(),
    query('dateTo').escape(),
],
    putUser,
    (req: Request, res: Response, next: NextFunction) => new HistoryController(req, res, next).getPlayerHistory()
);

export default router;