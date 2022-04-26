const { Router } = require('express');
const { body, cookie } = require('express-validator');

import { NextFunction, Request, Response } from 'express';
import Auth from '../../controller/auth_controller';

const router = Router();

router.post('/login', [
    cookie('sid_').escape(),
    body('nick').escape(),
    body('password').escape()
], (req: Request, res: Response, next: NextFunction) => new Auth(req, res, next).login());

router.get('/isLogin', cookie('sid_').escape(), (req: Request, res: Response, next: NextFunction) => new Auth(req, res, next).isLogin());

router.get('/logout', cookie('sid_').escape(), (req: Request, res: Response, next: NextFunction) => new Auth(req, res, next).logout());

export default router;