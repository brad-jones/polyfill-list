import * as semver from 'semver';
import browserslist = require('browserslist');
import polyFillService = require('polyfill-service');

export interface IBrowser
{
    name: string;
    version: string;
}

export interface IBrowsersListOptions
{
    path?: string;
    env?: string;
    config?: string;
    stats?: { [key: string]: any };
}

export interface IPolyFillList
{
    GeneratePolyFillList(): Promise<string[]>;
}

export class PolyFillList implements IPolyFillList
{
    protected browsers: IBrowser[];

    public constructor(queries?: string|string[], opts?: IBrowsersListOptions)
    {
        this.browsers = this.convertBrowsersListToIBrowserArray
        (
            browserslist(queries, opts)
        );
    }

    public async GeneratePolyFillList(): Promise<string[]>
    {
        let requiredPolyFills: string[] = [];

        for (let fill of await polyFillService.listAllPolyfills())
        {
            // Ignore all fills that start with an underscore.
            // These appear to be only used as dependecies to other polyfills.
            // ie: They do not add anything directly to the global environment.
            if (fill.startsWith('_')) continue;

            // Ignore all the actual locales, specfic locales would
            // need to be added manually as required by the developer.
            if (fill.startsWith('Intl.')) continue;

            let fillMeta = await polyFillService.describePolyfill(fill);

            // If the word "deprecated" is mentioned anywhere in the metadata,
            // in the notes section for example, we will exclude it, a developer
            // would then need to manually add such polyfills to the list.
            if (JSON.stringify(fillMeta).includes('deprecated')) continue;

            // Ignore any polyfills that do not have a browsers section
            // NOTE: AudioContext appears to be the only one effected by this.
            if (!fillMeta.browsers) continue;

            for (let browser of this.browsers)
            {
                // Match against the browser name / key.
                // TODO: This may require further mapping between
                // "browserslist" & "polyfill-service" values.
                if (fillMeta.browsers[browser.name])
                {
                    if (this.browserVersionMatches(browser.version, fillMeta.browsers[browser.name]))
                    {
                        if (requiredPolyFills.indexOf(fill) === -1)
                        {
                            requiredPolyFills.push(fill);
                        }
                    }
                }
            }
        }

        return requiredPolyFills;
    }

    protected convertBrowsersListToIBrowserArray(browsers: string[]): IBrowser[]
    {
        let iBrowserArray: IBrowser[] = [];

        for (let browser of browsers)
        {
            let segments = browser.split(' ');
            let browserName = segments[0];
            let browserVersions = segments[1].split('-');

            for (let browserVersion of browserVersions)
            {
                iBrowserArray.push({name: browserName, version: browserVersion});
            }
        }

        return iBrowserArray;
    }

    protected browserVersionMatches(browsersListVersion: string, polyFillServiceVersion: string): boolean
    {
        // Do some quick and easy checks first
        if (browsersListVersion === polyFillServiceVersion) return true;
        if (polyFillServiceVersion === '*') return true;
        if (browsersListVersion === 'all') return true;

        // Otherwise convert the browser version into a semver.
        let version = semver.clean(browsersListVersion, true);
        if (version === null) version = semver.clean(browsersListVersion + '.0.0', true);
        if (version === null) version = semver.clean(browsersListVersion + '.0', true);
        if (version === null) throw new Error(`Could not convert '${browsersListVersion}' into semver`);

        // Then check to see if it satisfies the polyFill range.
        return semver.satisfies(version, polyFillServiceVersion, true);
    }
}
