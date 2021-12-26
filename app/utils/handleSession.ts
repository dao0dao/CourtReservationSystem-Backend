import appDir from "./appDir";
import { join } from 'path';
import { access, writeFile, mkdir, readFile } from 'fs/promises';
import { expiresDate } from "./expiresDate";

export const createSessionFile = async (id: string, userId: string) => {
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
        let isWritten = await writeFile(filePath, JSON.stringify(session), 'utf8').then(() => { return true; }).catch((err) => { if (err) { console.log(err); return false; } });
        if (isWritten === undefined) {
            return true;
        } else {
            return false;
        }
    }
    return true;
};

export const checkSessionFile = async (key: string): Promise<boolean> => {
    const sessionPath = join(appDir, 'session', 'sid_' + key + '.json');
    let isExist = await access(sessionPath).catch((err) => { if (err) { return false; } });
    if (isExist === false) {
        return false;
    }
    const file = await readFile(sessionPath, 'utf8').then((res) => { return JSON.parse(res); });
    if (new Date(file.expires).getTime() < new Date().getTime() || !file.expires) {
        return false;
    }
    return true;
};

export const extendSession = async (key: string): Promise<boolean | string> => {
    const sessionPath = join(appDir, 'session', 'sid_' + key + '.json');
    let isExist = await access(sessionPath).catch((err) => { if (err) { return false; } });
    if (isExist === false) {
        return false;
    }
    const file = await readFile(sessionPath, 'utf8').then((res) => { return JSON.parse(res); });
    file.expires = expiresDate;
    let isWritten = await writeFile(sessionPath, JSON.stringify(file), 'utf8').catch((err) => { if (err) { console.log(err); return false; } });
    if (isWritten === undefined) {
        return file.userId;
    } else {
        return false;
    }
};