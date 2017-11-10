import { PolyFillList, IBrowser } from '../../dist';
import { Expect, Test, AsyncTest, Timeout, TestCase } from "alsatian";

export class PolyFillListFixture
{
    @TestCase([], [])
    @TestCase(['foo 123'], [{name: 'foo', version: '123'}])
    @TestCase(['foo 1.2.3-1.2.4'], [{name: 'foo', version: '1.2.3'}, {name: 'foo', version: '1.2.4'}])
    public convertBrowsersListToIBrowserArrayTest(input: string[], expected: IBrowser[])
    {
        Expect((new PolyFillList() as any).convertBrowsersListToIBrowserArray(input)).toEqual(expected);
    }

    @TestCase({ browsersListVersion: 'abc', polyFillServiceVersion: 'abc' }, true)
    @TestCase({ browsersListVersion: 'abc', polyFillServiceVersion: '*' }, true)
    @TestCase({ browsersListVersion: 'all', polyFillServiceVersion: 'abc' }, true)
    @TestCase({ browsersListVersion: '1', polyFillServiceVersion: '1' }, true)
    @TestCase({ browsersListVersion: '1.0', polyFillServiceVersion: '1' }, true)
    @TestCase({ browsersListVersion: '1.0.0', polyFillServiceVersion: '1' }, true)
    @TestCase({ browsersListVersion: '1', polyFillServiceVersion: '2' }, false)
    @TestCase({ browsersListVersion: '1.0', polyFillServiceVersion: '2' }, false)
    @TestCase({ browsersListVersion: '1.0.0', polyFillServiceVersion: '2' }, false)
    @TestCase({ browsersListVersion: '10', polyFillServiceVersion: '6 - 8' }, false)
    @TestCase({ browsersListVersion: '7', polyFillServiceVersion: '6 - 8' }, true)
    @TestCase({ browsersListVersion: '7', polyFillServiceVersion: '<8' }, true)
    @TestCase({ browsersListVersion: '7', polyFillServiceVersion: '>8' }, false)
    public browserVersionMatchesTest(input: { browsersListVersion: string, polyFillServiceVersion: string }, expected: boolean)
    {
        Expect((new PolyFillList() as any).browserVersionMatches(input.browsersListVersion, input.polyFillServiceVersion)).toBe(expected);
    }

    @Test()
    public browserVersionMatchesThrowsWhenBogusVersionProvided()
    {
        Expect(() => (new PolyFillList() as any).browserVersionMatches('abc', '1'))
            .toThrowError(Error, "Could not convert 'abc' into semver");
    }
}
