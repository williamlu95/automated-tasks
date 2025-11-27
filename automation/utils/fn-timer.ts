export const timeFn = async (fn: () => Promise<void>, name: string) => {
  const startTime = Date.now();
  console.log(name);

  await fn();

  const endTime = Date.now();
  console.log(`${name} took ${(endTime - startTime) / 1000} seconds`);
};
