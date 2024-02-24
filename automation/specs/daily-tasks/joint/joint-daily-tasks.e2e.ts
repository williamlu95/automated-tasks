import { verifyJointBalances } from './verify-joint-balances';

describe.skip('Joint daily tasks', () => {
  before(async () => {
    await verifyJointBalances();
  });

  it('tasks have successfully ran', () => expect(true).toEqual(true));
});
