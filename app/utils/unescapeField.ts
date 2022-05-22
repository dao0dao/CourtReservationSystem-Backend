import Request from '../routing/interfaces/request_interfaces';
import { NextFunction, Response } from 'express';

function fixField(req: Request, field: string) {
    const quoteRegEx = /&quot;/g;
    const slashRegEx = /&#x2F;/g;
    const majorityRegEx = /&gt;/g;
    const minorityRegEx = /&lt;/g;
    req.body[field] = req.body[field].replace(quoteRegEx, '"').replace(slashRegEx, "/").replace(majorityRegEx, ">").replace(minorityRegEx, "<");
}

export function unescapeField(fieldName: string | string[]) {
    if (!Array.isArray(fieldName)) {
        const field = fieldName;
        return (req: Request, res: Response, next: NextFunction) => {
            if (req.body[field]) {
                fixField(req, field);
            }
            next();
        };
    };
    if (Array.isArray(fieldName)) {
        return (req: Request, res: Response, next: NextFunction) => {
            for (let i in fieldName) {
                const field = fieldName[i];
                if (req.body[field]) {
                    fixField(req, field);
                }
            }
            next();
        };
    }
}