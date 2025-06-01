import { verifyJointBalances } from './verify-joint-balances';

export const runJointDailyTasks = async () => {
  await verifyJointBalances();
};
