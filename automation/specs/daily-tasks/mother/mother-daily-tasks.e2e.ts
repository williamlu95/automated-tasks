import { verifyMothersBalances } from './verify-mothers-balances';

describe('Mother daily tasks', () => {
  before(async () => {
    await verifyMothersBalances();
  });

  it('tasks have successfully ran', () => expect(true).toEqual(true));
});
