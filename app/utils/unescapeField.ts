import Request from '../routing/interfaces/request_interfaces';
import { NextFunction, Response } from 'express';

export function unescapeField(field: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.body[field]) {
            const quoteRegEx = /&quot;/g;
            const slashRegEx = /&#x2F;/g;
            const majorityRegEx = /&gt;/g;
            const minorityRegEx = /&lt;/g;
            req.body[field] = req.body[field].replace(quoteRegEx, '"').replace(slashRegEx, "/").replace(majorityRegEx, ">").replace(minorityRegEx, "<");
        }
        next();
    };
}