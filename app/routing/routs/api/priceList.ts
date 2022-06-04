const { Router } = require('express');
import PriceListController from "../../controller/priceList_controller";
import { Response, NextFunction } from 'express';
import Request from "../../interfaces/request_interfaces";
import { putUser } from "../../../utils/putUser";
const { body, param, cookie } = require('express-validator');

const router = new Router();

router.get('/price/list', cookie('sid_').escape(), putUser,
    (req: Request, res: Response, next: NextFunction) => new PriceListController(req, res, next).getAllPriceLists()
);

router.post('/price/list', [
    cookie('sid_').escape(),
    body('id').escape().optional({ checkFalsy: true }),
    body('name').escape().isLength({ min: 1, max: 150 }),
    body('hours').custom(
        (val) => {
            const regEx = /(\<|\>|\/){1,}/g;
            if (regEx.test(val)) {
                throw new Error('Invalid hours');
            }
            return true;
        }
    )
], putUser, (req: Request, res: Response, next: NextFunction) => new PriceListController(req, res, next).createPriceList());

router.put('/price/list', [
    cookie('sid_').escape(),
    body('id').escape().optional({ checkFalsy: true }),
    body('name').escape().isLength({ min: 1, max: 150 }),
    body('hours').custom(
        (val) => {
            const regEx = /(\<|\>|\/){1,}/g;
            if (regEx.test(val)) {
                throw new Error('Invalid hours');
            }
            return true;
        }
    )
], putUser, (req: Request, res: Response, next: NextFunction) => new PriceListController(req, res, next).editPriceList());

router.delete('/price/list/:id', [
    cookie('sid_').escape(),
    param('id')
        .escape()
        .custom((val: string) => {
            const regEx = /(^\w*-){1}(\w*-)*(\w+$)/;
            const found = val.match(regEx);
            if (found) {
                return true;
            }
            throw new Error('Invalid id');
        }),
], putUser, (req: Request, res: Response, next: NextFunction) => new PriceListController(req, res, next).deletePriceList());

export default router;