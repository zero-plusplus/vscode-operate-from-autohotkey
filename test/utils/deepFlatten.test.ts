import { describe, expect, test } from '@jest/globals';
import { deepFlatten } from '../../src/utils/deepFlatten';

describe('deepFlatten', () => {
  test('deepFlatten', () => {
    expect(deepFlatten({
      a: {
        b: { c: 'a.b.c' },
        e: [
          1,
          { f: 5 },
        ],
      },
    })).toEqual(({
      'a.b.c': 'a.b.c',
      'a.e[0]': 1,
      'a.e[1].f': 5,
    }));
  });
});
