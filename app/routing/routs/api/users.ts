const { Router } = require('express');
const { body, param, cookie } = require('express-validator');

import { NextFunction, Response } from 'express';
import Request from '../../interfaces/request_interfaces';
import User from '../../controller/user_controller';
import { putUser } from '../../../utils/putUser';


const router = Router();

router.get('/user', putUser, cookie('sid_').escape(), (req: Request, res: Response, next: NextFunction) => {
    return new User(req, res, next).getUser();
});

router.post('/user', putUser, [
    cookie('sid_').escape(),
    body('name').isAlphanumeric(['pl-PL']).isLength({ min: 3, max: 15 }).escape(),
    body('login').isAlphanumeric(['pl-PL']).isLength({ min: 3, max: 15 }).escape(),
    body('newPassword').isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }).escape(),
    body('confirmNewPassword').isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }).escape().custom((val: string, { req }) => {
        if (val !== req.body.newPassword) {
            throw new Error('Passwords does not match');
        }
        return true;
    }),
], (req: Request, res: Response, next: NextFunction) => {
    return new User(req, res, next).updateLoginUser();
});

router.post('/user/create', putUser, [
    cookie('sid_').escape(),
    body('name').escape().isAlphanumeric(['pl-PL']).isLength({ min: 3, max: 15 }),
    body('login').escape().isAlphanumeric(['pl-PL']).isLength({ min: 3, max: 15 }),
    body('password').escape().isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }),
    body('confirmPassword').escape().isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }).escape().custom((val: string, { req }) => {
        if (val !== req.body.password) {
            throw new Error('Passwords does not match');
        }
        return true;
    }),
], (req: Request, res: Response, next: NextFunction) => {
    return new User(req, res, next).createUser();
});

router.get('/user/list', putUser, cookie('sid_').escape(), (req: Request, res: Response, next: NextFunction) => {
    return new User(req, res, next).getListOfUsers();
});

router.post('/user/list/update', putUser, [
    cookie('sid_').escape(),
    body('id')
        .escape()
        .custom((val: string) => {
            const regEx = /(^\w*-){1}(\w*-)*(\w+$)/;
            const found = val.match(regEx);
            if (found) {
                return true;
            }
            throw new Error('Invalid id');
        }),
    body('name').escape().isAlphanumeric(['pl-PL']).isLength({ min: 3, max: 15 }),
    body('login').escape().isAlphanumeric(['pl-PL']).isLength({ min: 3, max: 15 }),
    body('password').escape().isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }),
    body('confirmPassword').escape().isAlphanumeric(['pl-PL']).isLength({ min: 5, max: 10 }).escape().custom((val: string, { req }) => {
        if (val !== req.body.password) {
            throw new Error('Passwords does not match');
        }
        return true;
    }),
], (req: Request, res: Response, next: NextFunction) => {
    return new User(req, res, next).updateUser();
});

router.delete('/user/delete/:id', putUser, [
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
], (req: Request, res: Response, next: NextFunction) => {
    return new User(req, res, next).deleteUser();
});

export default router;