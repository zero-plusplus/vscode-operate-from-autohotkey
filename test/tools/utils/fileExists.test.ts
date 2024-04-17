import { describe, expect, test } from '@jest/globals';
import { fileExists } from '../../../src/tools/utils/fileExists';

describe('fileExists', () => {
  test('fileExists', () => {
    expect(fileExists('unknownPath')).toBeFalsy();
    expect(fileExists(__filename)).toBeTruthy();
  });
});
