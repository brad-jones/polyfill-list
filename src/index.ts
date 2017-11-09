import * as path from 'path';
import * as shell from 'shelljs';

// Hopefully this is a temp fix.
// For whatever reason the most recent version of the polyfill-service does
// not include the `__dist` folder, so we will build it on first run.
// see: https://github.com/Financial-Times/polyfill-service/issues/1363
// and: https://github.com/Financial-Times/polyfill-service/issues/1360
try
{
    require('polyfill-service/polyfills/__dist/aliases.json');
}
catch(e)
{
    shell.exec('npm run build',
    {
        cwd: path.dirname(path.dirname(require.resolve('polyfill-service')))
    });
}

export * from './PolyFillList';
