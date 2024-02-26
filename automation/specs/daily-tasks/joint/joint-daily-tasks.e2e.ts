import { verifyJointBalances } from './verify-joint-balances';

describe('Joint daily tasks', () => {
  before(async () => {
    await verifyJointBalances();
  });

  it('tasks have successfully ran', () => expect(true).toEqual(true));
});
