import appDir from "./appDir";
import { join } from 'path';
import createFile from "./createFile";



function writeUnhandledErrorToLog() {

    process.on('unhandledRejection', async (reason: Error, promise: any) => {
        /* Zapis nie obsłużonego błędu */
        const date = new Date();
        const data = `Nieobsłużony błąd, powód: ${reason.message} w plikach: ${reason.stack}`;
        const filename = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + 'T.' + date.getHours() + '.' + date.getMinutes() + '.log';
        const path = join(appDir, 'logs', 'unhandled');
        await createFile(path, filename, data);
        process.exit(1);
    });
}

export default writeUnhandledErrorToLog;