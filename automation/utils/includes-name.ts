export const includesName = (description: string, name: string): boolean => {
  const normalizedDescription = description.replace(/\s/g, '').toLowerCase();
  const normalizedName = name.replace(/\s/g, '').toLowerCase();

  return normalizedDescription.includes(normalizedName);
};
