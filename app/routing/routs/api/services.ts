const { Router } = require('express');
import { Response, NextFunction } from 'express';
import Request from "../../interfaces/request_interfaces";
import { putUser } from "../../../utils/putUser";
import ServiceController from '../../controller/services_controller';
import { Services } from '../../interfaces/servies_interface';
const { body, param, cookie } = require('express-validator');

const router = new Router();

router.get('/price/services', cookie('sid_').escape(), putUser,
    (req: Request, res: Response, next: NextFunction) => new ServiceController(req, res, next).getAllServices());

router.patch('/price/services', [
    cookie('sid_').escape(),
    body().custom(
        (body: { [key: string]: Services; }) => {
            const costRegEx = /^\d*(\.\d{1,2}){0,1}$/;
            for (let i in body) {
                if (typeof (i) !== 'string' || typeof (body[i].name) !== 'string' || !(body[i].cost.toString()).match(costRegEx)) {
                    throw new Error('Invalid data');
                }
            }
            return true;
        }
    )
], putUser,
    (req: Request, res: Response, next: NextFunction) => new ServiceController(req, res, next).createOrUpdateServices());

router.delete('/price/services/:id', cookie('sid_').escape(), param('id').escape(), putUser,
    (req: Request, res: Response, next: NextFunction) => new ServiceController(req, res, next).deleteServices());

router.post('/price/services/charge', cookie('sid_').escape(), [
    body('id').escape(),
    body('value').custom(
        (v: string | number) => {
            const costRegEx = /^\d*(\.\d{1,2}){0,1}$/;
            const value = v.toString();
            if (!value.match(costRegEx)) {
                throw new Error('Invalid data');
            }
            return true;
        }
    ),
    body('name').escape(),
    body('serviceName').escape(),
    body('action').escape()
], putUser, (req: Request, res: Response, next: NextFunction) => new ServiceController(req, res, next).chargeAccount());

export default router;