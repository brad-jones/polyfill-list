import { PolyFillList } from '../../dist';
import { Expect, Test, AsyncTest, Timeout, TestCase } from "alsatian";

export class PolyFillListFixture
{
    @TestCase({ browsersListVersion: 'abc', polyFillServiceVersion: 'abc' }, true)
    @TestCase({ browsersListVersion: 'abc', polyFillServiceVersion: '*' }, true)
    @TestCase({ browsersListVersion: 'all', polyFillServiceVersion: 'abc' }, true)
    @TestCase({ browsersListVersion: '1', polyFillServiceVersion: '1' }, true)
    @TestCase({ browsersListVersion: '1.0', polyFillServiceVersion: '1' }, true)
    @TestCase({ browsersListVersion: '1.0.0', polyFillServiceVersion: '1' }, true)
    @TestCase({ browsersListVersion: '1', polyFillServiceVersion: '2' }, false)
    @TestCase({ browsersListVersion: '1.0', polyFillServiceVersion: '2' }, false)
    @TestCase({ browsersListVersion: '1.0.0', polyFillServiceVersion: '2' }, false)
    public browserVersionMatchesTest(input: { browsersListVersion: string, polyFillServiceVersion: string }, expected: boolean)
    {
        Expect((new PolyFillList() as any).browserVersionMatches(input.browsersListVersion, input.polyFillServiceVersion)).toBe(expected);
    }

    @Test()
    public browserVersionMatchesThrowsWhenBogusVersionProvided()
    {
        Expect(() => (new PolyFillList() as any).browserVersionMatches('abc', '1')).toThrowError(Error, "Could not convert 'abc' into semver");
    }
}
