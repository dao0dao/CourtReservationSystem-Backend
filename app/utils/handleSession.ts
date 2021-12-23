import appDir from "./appDir";
import { join } from 'path';
import { access, writeFile, mkdir } from 'fs/promises';
import { expiresDate } from "./expiresDate";

export const createSessionFile = async (id: string, userId: string): Promise<boolean> => {
    const sesDirPath = join(appDir, 'session');
    let isFolder = await access(sesDirPath).catch((err) => { if (err) { return false; } });
    if (isFolder === false) {
        await mkdir(sesDirPath);
    }
    const filePath = join(appDir, 'session', 'sid_' + id + '.json');
    let isExist = await access(filePath).catch((err) => { if (err) { return false; } });
    isExist = !!isExist;
    if (!isExist) {
        let session = {
            userId,
            expires: expiresDate
        };
        let isWritten = await writeFile(filePath, JSON.stringify(session)).then(() => { return true; }).catch((err) => { if (err) { console.log(err); return false; } });
        if (isWritten === undefined) {
            return true;
        } else {
            return false;
        }
    }
    return true;
};