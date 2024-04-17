import { describe, expect, test } from '@jest/globals';
import { createMutex } from '../../../src/tools/utils/createMutex';
import { sleep } from '../../../src/tools/utils/sleep';

describe('createMutex', () => {
  test('main', async() => {
    const results: string[] = [];
    const mutex = createMutex();

    const promises: Array<Promise<any>> = [];
    promises.push(mutex.use(async() => {
      await sleep(1000);
      results.push('a');
    }));
    promises.push(mutex.use(async() => {
      await sleep(500);
      results.push('b');
    }));

    await Promise.all(promises);
    expect(results).toEqual([ 'a', 'b' ]);
  });
  test('singleton', () => {
    expect(createMutex()).toBe(createMutex());
    expect(createMutex()).not.toBe(createMutex('key'));
    expect(createMutex('key')).toBe(createMutex('key'));
  });
});
