import { plugin } from './plugin';

describe('travis-ci', () => {
  it('should export plugin', () => {
    expect(plugin).toBeDefined();
  });
});
