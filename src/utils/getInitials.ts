export const getInitials = (name: string): string => {
  if (!name) return "."; // Return a default if name is empty

  const words = name.trim().split(/\s+/);
  if (words.length === 0) return ".";

  const firstInitial = words[0][0] || ".";
  const lastInitial = words.length > 1 ? words[words.length - 1][0] || "" : "";

  return `${firstInitial}${lastInitial}`.toUpperCase();
};

