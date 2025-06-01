import { verifyMothersBalances } from './verify-mothers-balances';

export const runMotherDailyTasks = async () => {
  await verifyMothersBalances();
};
