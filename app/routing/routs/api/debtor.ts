const { Router } = require('express');
import DebtorController from '../../controller/debtors_controller';
import { Response, NextFunction } from 'express';
import Request from "../../interfaces/request_interfaces";
import { putUser } from "../../../utils/putUser";
const { cookie } = require('express-validator');

const router = new Router();

router.get('/price/balance/debtors', [
    cookie('sid_').escape(),
],
    putUser,
    (req: Request, res: Response, next: NextFunction) => new DebtorController(req, res, next).getAllDebtors()
);

export default router;