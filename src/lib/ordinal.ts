export default (number: number): string => {
 const [x, y] = [number % 10, number % 100];
 return x == 1 && y !== 11 ? `st` : x == 2 && y != 12 ? `nd` : x == 3 && y != 13 ? `rd` : `th`;
};

export const convertMinutes = (time: number) => {
 return {
  days: ~~(time / 24 / 60),
  hours: +((time / 60) % 24).toFixed(0),
  minutes: time % 60,
 };
};
