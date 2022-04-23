const { Router } = require('express');
const { body, cookie, check, query } = require('express-validator');
import { putUser } from "../../../utils/putUser";
import { NextFunction, Response } from 'express';
import Request from '../../interfaces/request_interfaces';
import Timetable from "../../controller/reservation_controller";

const router = new Router();

router.get('/reservation', [
    cookie('sid_').escape(),
    query('date').escape().isAlphanumeric(['pl-PL'], { ignore: '-' }).isLength({ min: 9, max: 10 })
], putUser, (req: Request, res: Response, next: NextFunction) => { return new Timetable(req, res, next).getReservationsFromDate(); });

router.post('/reservation/add', [
    cookie('sid_').escape(),
    body('id').escape().optional({ checkFalsy: true }),
    check('timetable.transformY').escape().isNumeric(),
    check('timetable.transformX').escape().isNumeric(),
    check('timetable.ceilHeight').escape().isNumeric(),
    check('timetable.zIndex').escape().isNumeric(),
    check('form.date').escape().isAlphanumeric(['pl-PL'], { ignore: '-' }).isLength({ min: 9, max: 10 }),
    check('form.timeFrom').escape().isAlphanumeric(['pl-PL'], { ignore: ':' }).isLength({ min: 5, max: 5 }),
    check('form.timeTo').escape().isAlphanumeric(['pl-PL'], { ignore: ':' }).isLength({ min: 5, max: 5 }),
    check('form.court').escape().escape().isNumeric().isLength({ min: 1, max: 1 }),
    check('form.playerOne').escape().optional({ checkFalsy: true }),
    check('form.playerTwo').escape().optional({ checkFalsy: true }),
    check('form.guestOne').escape().isAlphanumeric(['pl-PL'], { ignore: ' -' }).optional({ checkFalsy: true }),
    check('form.guestTwo').escape().isAlphanumeric(['pl-PL'], { ignore: ' -' }).optional({ checkFalsy: true }),
    check('payment.hourCount').escape().isNumeric().isLength({ min: 1, max: 2 }),
    check('isPayed').escape().isAlpha().isLength({ min: 4, max: 5 }),
], putUser, (req: Request, res: Response, next: NextFunction) => { return new Timetable(req, res, next).addReservation(); });

router.put('/reservation', [
    cookie('sid_').escape(),
    body('id').escape(),
    check('timetable.transformY').escape().optional({ checkFalsy: true }).isNumeric(),
    check('timetable.transformX').escape().optional({ checkFalsy: true }).isNumeric(),
    check('timetable.ceilHeight').escape().optional({ checkFalsy: true }).isNumeric(),
    check('timetable.zIndex').escape().optional({ checkFalsy: true }).isNumeric(),
    check('form.date').escape().optional({ checkFalsy: true }).isAlphanumeric(['pl-PL'], { ignore: '-' }).isLength({ min: 9, max: 10 }),
    check('form.timeFrom').escape().optional({ checkFalsy: true }).isAlphanumeric(['pl-PL'], { ignore: ':' }).isLength({ min: 5, max: 5 }),
    check('form.timeTo').escape().optional({ checkFalsy: true }).isAlphanumeric(['pl-PL'], { ignore: ':' }).isLength({ min: 5, max: 5 }),
    check('form.court').escape().optional({ checkFalsy: true }).isNumeric().isLength({ min: 1, max: 1 }),
    check('form.playerOne').escape().optional({ checkFalsy: true }),
    check('form.playerTwo').escape().optional({ checkFalsy: true }),
    check('form.guestOne').escape().optional({ checkFalsy: true }).isAlphanumeric(['pl-PL'], { ignore: ' -' }).optional({ checkFalsy: true }),
    check('form.guestTwo').escape().optional({ checkFalsy: true }).isAlphanumeric(['pl-PL'], { ignore: ' -' }).optional({ checkFalsy: true }),
    check('payment.hourCount').escape().optional({ checkFalsy: true }).isNumeric().isLength({ min: 1, max: 2 }),
    check('isPayed').escape().isAlpha().optional({ checkFalsy: true }).isLength({ min: 4, max: 5 }),
], putUser, (req: Request, res: Response, next: NextFunction) => { return new Timetable(req, res, next).updateReservation(); });

export default router;