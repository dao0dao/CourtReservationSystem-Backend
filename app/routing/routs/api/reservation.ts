const { Router } = require('express');
const { body, cookie, check } = require('express-validator');
import { putUser } from "../../../utils/putUser";
import { NextFunction, Response } from 'express';
import Request from '../../interfaces/request_interfaces';
import Reservation from "../../controller/reservation_controller";

const router = new Router();



router.post('/reservation/add', [
    cookie('sid_').escape(),
    body('id').escape().optional({ checkFalsy: true }),
    check('timetable.transformY').escape().isNumeric(),
    check('timetable.transformX').escape().isNumeric(),
    check('timetable.ceilHeight').escape().isNumeric(),
    check('timetable.zIndex').escape().isNumeric(),
    check('form.date').escape().isAlphanumeric(['pl-PL'],{ ignore: '-' }).isLength({ min: 9, max: 10 }),
    check('form.timeFrom').escape().isAlphanumeric(['pl-PL'],{ ignore: ':' }).isLength({ min: 5, max: 5 }),
    check('form.timeTo').escape().isAlphanumeric(['pl-PL'],{ ignore: ':' }).isLength({ min: 5, max: 5 }),
    check('form.court').escape().escape().isNumeric().isLength({ min: 1, max: 1 }),
    check('form.playerOne').escape().optional({ checkFalsy: true }),
    check('form.playerTwo').escape().optional({ checkFalsy: true }),
    check('form.guestOne').escape().isAlphanumeric(['pl-PL'],{ ignore: ' -' }).optional({ checkFalsy: true }),
    check('form.guestTwo').escape().isAlphanumeric(['pl-PL'],{ ignore: ' -' }).optional({ checkFalsy: true }),
    check('payment.hourCount').escape().isNumeric().isLength({ min: 1, max: 2 }),
    check('isPayed').escape().isAlpha().isLength({ min: 4, max: 5 }),
], putUser, (req: Request, res: Response, next: NextFunction) => { return new Reservation(req, res, next).addReservation(); });

export default router;