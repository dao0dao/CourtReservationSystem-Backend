import appDir from './appDir';
import { join } from 'path';
import { access, mkdir, writeFile } from 'fs/promises';

async function createFile(filename: string, data: string): Promise<boolean | undefined> {
    const path = join(appDir, 'logs');
    const subfolderPath = join(appDir, 'logs', 'unhandled');
    const filePath = join(subfolderPath, filename);
    const isFolder = await access(path).catch((err) => { if (err) { return false; } });
    if (!isFolder) {
        await mkdir(path).catch((err) => { if (err) { return false; } });
    }
    const isSubfolder = await access(subfolderPath).catch((err) => { if (err) { return false; } });
    if (!isSubfolder) {
        await mkdir(subfolderPath).catch((err) => { if (err) { return false; } });
    }
    const isFile = await access(filePath).catch((err) => { if (err) { return false; } });
    if (!isFile) {
        const create = await writeFile(filePath, data, 'utf-8').then(() => true).catch((err) => { console.log(err); if (err) { return false; } });
        return create;
    }
    const create = await writeFile(filePath + '-1', data, 'utf-8').then(() => true).catch((err) => { if (err) { return false; } });
    return create;
}
export default createFile;