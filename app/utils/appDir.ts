const { dirname, join } = require('path');
const appDir = dirname(require.main?.filename);

export const PublicFiles = join(appDir, '..', '..', 'frontApp');
export const Index = join(PublicFiles, 'index.html');

export default appDir;