import { describe, expect, test } from '@jest/globals';
import { fileExists } from '../../src/utils/fileExists';

describe('fileExists', () => {
  test('fileExists', () => {
    expect(fileExists('unknownPath')).toBeFalsy();
    expect(fileExists(__filename)).toBeTruthy();
  });
});
