export const randomIntString = (length: number = 4) => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};
