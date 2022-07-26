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
    check('payment.hourCount').escape().isNumeric(['pl-PL'], { no_symbols: false }).isLength({ min: 1, max: 5 }),
    check('isPlayerOnePayed').escape(),
    check('isPlayerTwoPayed').escape(),
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
    check('payment.hourCount').escape().optional({ checkFalsy: true }).isNumeric(['pl-PL'], { no_symbols: false }).isLength({ min: 1, max: 5 }),
    check('isPlayerOnePayed').escape(),
    check('isPlayerOnePayed').escape(),
], putUser, (req: Request, res: Response, next: NextFunction) => { return new Timetable(req, res, next).updateReservation(); });

router.delete('/reservation/:id', [
    cookie('sid_').escape()
], putUser, (req: Request, res: Response, next: NextFunction) => { return new Timetable(req, res, next).deleteReservation(); });

router.put('/reservation/payment', [
    cookie('sid_').escape(),
    check('playerOne.id').escape(),
    check('playerOne.method').escape(),
    check('playerOne.name').escape(),
    check('playerOne.serviceName').escape(),
    check('playerOne.value').escape(),
    check('playerTwo.id').escape(),
    check('playerTwo.method').escape(),
    check('playerTwo.name').escape(),
    check('playerTwo.serviceName').escape(),
    check('playerTwo.value').escape(),
], putUser, (req: Request, res: Response, next: NextFunction) => { return new Timetable(req, res, next).payForReservations(); });

export default router; 