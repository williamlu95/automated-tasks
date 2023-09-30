import { verifyMothersBalances } from './verify-mothers-balances';

describe('Weekly tasks', () => {
  before(async () => {
    await verifyMothersBalances();
  });

  it('tasks have successfully ran', () => expect(true).toEqual(true));
});
