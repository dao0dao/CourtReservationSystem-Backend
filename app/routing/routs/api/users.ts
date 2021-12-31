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
router.get('/user/list', putUser, (req: Request, res: Response, next: NextFunction) => {
    return new User(req, res, next).getUser();
});

export default router;