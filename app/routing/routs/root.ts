const { Router } = require('express');
import { Request, Response } from 'express';
import {Index} from '../../utils/appDir';

const router = Router();

router.get('*', (req: Request, res: Response, next: any) => {
    res.sendFile(Index);
});




export default router;