const { Router } = require('express');
const { body } = require('express-validator');

import { NextFunction, Request, Response } from 'express';
import Auth from '../../controller/auth_controller';

const router = Router();


router.post('/login', [
    body('nick').escape().isAlpha(),
    body('password').escape().isAlphanumeric()
], (req: Request, res: Response, next: NextFunction) => new Auth(req, res, next).login());




export default router;