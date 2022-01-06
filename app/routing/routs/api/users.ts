const { Router } = require('express');
const { body } = require('express-validator');

import { NextFunction, Response } from 'express';
import Request from '../../../utils/interfaces';
import User from '../../controller/user_controller';
import { putUser } from '../../../utils/putUser';


const router = Router();

router.get('/user', putUser, (req: Request, res: Response, next: NextFunction) => {
    return new User(req, res, next).getUser();
});

router.post('/user', putUser, [
    body('name').isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }).escape(),
    body('login').isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }).escape(),
    body('newPassword').isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }).escape(),
    body('confirmNewPassword').isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }).escape().custom((val: string, { req }) => {
        if (val !== req.body.newPassword) {
            throw new Error('Passwords does not match');
        }
        return true;
    }),
], (req: Request, res: Response, next: NextFunction) => {
    return new User(req, res, next).updateUser();
});

router.post('/user/create', putUser, [
    body('name').isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }).escape(),
    body('login').isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }).escape(),
    body('password').isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }).escape(),
    body('confirmPassword').isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }).escape().custom((val: string, { req }) => {
        if (val !== req.body.password) {
            throw new Error('Passwords does not match');
        }
        return true;
    }),
], (req: Request, res: Response, next: NextFunction) => {
    return new User(req, res, next).createUser();
});

router.get('/user/list', putUser, (req: Request, res: Response, next: NextFunction) => {
    return new User(req, res, next).getUser();
});

export default router;