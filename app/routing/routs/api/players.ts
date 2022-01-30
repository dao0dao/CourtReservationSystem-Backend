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
    body('email').escape().isEmail().normalizeEmail().isLength({ min: 0 }),
    body('account').escape().isNumeric().isLength({ min: 0 }),
    body('price').escape().isNumeric().isLength({ min: 0 }),
    body('court').escape().isNumeric().isLength({ min: 0 }),
    body('strings').escape().isLength({ min: 0, max: 20 }).isAlphanumeric(['pl-Pl'], { ignore: ' -' }),
    body('tension').escape().isNumeric().isLength({ min: 0, max: 2 }),
    body('balls').escape().isLength({ min: 0, max: 20 }).isAlphanumeric(['pl-Pl'], { ignore: ' -' }),
    body('weeks').escape(),
    body('opponents').escape(),
    body('notes').escape().isLength({ min: 0, max: 500 }).isAlphanumeric(['pl-Pl'], { ignore: ' -' }),
], putUser, (req: Request, res: Response, next: NextFunction) => {
    return new Players(req, res, next).addPlayer();
});

export default router;