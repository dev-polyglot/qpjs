import { describe, expect, test } from '@jest/globals';

import { Cmd } from '../src/index';

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

test('check run', async () => {
  const cmd = new Cmd();
  await cmd.run();
});
