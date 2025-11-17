export const normalizeGender = (g) => {
  if (!g) return null;
  const val = g.toString().trim().toLowerCase();
  if (["male", "female", "other"].includes(val)) return val;
  return null; // or throw custom error
};
