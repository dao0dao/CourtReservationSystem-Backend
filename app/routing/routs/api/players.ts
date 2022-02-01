const { Router } = require('express');
const { body, param, cookie } = require('express-validator');

import { NextFunction, Response } from 'express';
import Request from '../../../utils/interfaces';
import { putUser } from '../../../utils/putUser';
import Players from '../../controller/players_controller';

const router = new Router();

router.post('/players/addPlayer', [
    cookie('sid_').escape(),
    body('name').escape().isLength({ min: 2, max: 15 }).isAlpha(['pl-PL'], { ignore: ' -' }),
    body('surname').escape().isLength({ min: 2, max: 15 }).isAlpha(['pl-PL'], { ignore: ' -' }),
    body('telephone').escape().isLength({ min: 9, max: 9 }).isNumeric(),
    body('email').escape().optional({ checkFalsy: true }).isEmail().normalizeEmail(),
    body('account').escape().optional({ checkFalsy: true }).isNumeric(),
    body('priceSummer').escape().optional({ checkFalsy: true }).isNumeric(),
    body('priceWinter').escape().optional({ checkFalsy: true }).isNumeric(),
    body('court').escape().optional({ checkFalsy: true }).isNumeric(),
    body('strings').escape().optional({ checkFalsy: true }).isLength({ max: 20 }).isAlphanumeric(['pl-Pl'], { ignore: ' -' }),
    body('tension').escape().optional({ checkFalsy: true }).isNumeric().isLength({ max: 2 }),
    body('balls').escape().optional({ checkFalsy: true }).isLength({ max: 20 }).isAlphanumeric(['pl-Pl'], { ignore: ' -' }),
    body('weeks').custom(
        (val: Object) => {
            let str = JSON.stringify(val);
            str.replace(/\<*\>*\/*/g, '');
            str = JSON.parse(str);
            val = str;
            return true;
        }
    ),
    body('opponents').custom(
        (val: Object) => {
            let str = JSON.stringify(val);
            str.replace(/\<*\>*\/*/g, '');
            str = JSON.parse(str);
            val = str;
            return true;
        }
    ),
    body('notes').escape().optional({ checkFalsy: true }).isLength({ max: 500 }).isAlphanumeric(['pl-Pl'], { ignore: ' -' }),
], putUser, (req: Request, res: Response, next: NextFunction) => {
    return new Players(req, res, next).addPlayer();
});

export default router;