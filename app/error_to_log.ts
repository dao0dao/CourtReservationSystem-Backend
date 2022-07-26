import createFile from "./utils/createFile";

function writeUnhandledErrorToLog() {

    process.on('unhandledRejection', async (reason: Error, promise: any) => {
        /* Saving unhandled errors */
        const date = new Date();
        const data = `Nieobsłużony błąd, powód: ${reason.message} w plikach: ${reason.stack}`;
        const filename = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + 'T.' + date.getHours() + '.' + date.getMinutes() + '.log';
        await createFile(filename, data);
        process.exit(1);
    });
}

export { writeUnhandledErrorToLog };