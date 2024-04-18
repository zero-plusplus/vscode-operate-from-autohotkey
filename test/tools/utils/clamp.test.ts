import { describe, expect, test } from '@jest/globals';
import { clamp } from '../../../src/tools/utils/clamp';

describe('clamp', () => {
  test('main', () => {
    expect(clamp(100, 0, 100)).toBe(100);
    expect(clamp(100, 200, 300)).toBe(200);
    expect(clamp(100, -100, 0)).toBe(0);
    expect(clamp(100, 0, 0)).toBe(0);
    expect(clamp(-100, 0, 100)).toBe(0);
  });
});
