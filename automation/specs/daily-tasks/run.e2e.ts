import { timeFn } from '../../utils/fn-timer';
import { LastSync } from '../../utils/last-sync';
import { DailyTaskData } from './daily-task-data';
import { runJointDailyTasks } from './joint/joint-daily-tasks';
import { runMotherDailyTasks } from './mother/mother-daily-tasks';
import { runPersonalDailyTask } from './personal/personal-daily-tasks';

const updateLastSyncAt = async () => {
  await LastSync.updateLastSyncDate('wallet', Date.now());
};

describe('Run daily tasks', () => {
  before(async () => {
    await timeFn(DailyTaskData.initializeTransactions, 'Initializing daily task data');
    await timeFn(runPersonalDailyTask, 'Running personal daily tasks');
    await timeFn(runJointDailyTasks, 'Running joint daily tasks');
    await timeFn(runMotherDailyTasks, 'Running mother daily tasks');
    await timeFn(updateLastSyncAt, 'Updating last synced at');
  });

  it('tasks have successfully ran', () => expect(true).toEqual(true));
});
