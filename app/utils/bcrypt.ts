const bcrypt = require('bcrypt');
let hash: number;
if (process.env.BCRYPT_HASH !== undefined && process.env.BCRYPT_HASH !== '') {
    hash = parseInt(process.env.BCRYPT_HASH);
} else {
    hash = 13;
}
export async function creatPassword(pass: string): Promise<boolean> {
    const result = await bcrypt.hash(pass, hash);
    return result;
}
export async function comparePasswords(pass: string, hassPass: string): Promise<boolean> {
    const result = await bcrypt.compare(pass, hassPass);
    return result;
}