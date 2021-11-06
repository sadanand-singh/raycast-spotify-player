const Fuse = require('fuse.js');


export const searchResponse = (q: string | undefined, data:Object[] | undefined, keys: string[]) => {

  if (data === undefined || data === []) {
    return [];
  }

  if (q === '' || q === undefined) {
    return data;
  }

  const fuse = new Fuse(data, { "keys": keys});
  const result = fuse.search(q);
  return result.map(x => x.item);
};

export function msToHMS(milliseconds: number): string {
    const totalSeconds = parseInt(Math.floor(milliseconds / 1000).toString());
    const totalMinutes = parseInt(Math.floor(totalSeconds / 60).toString());
    const totalHours = parseInt(Math.floor(totalMinutes / 60).toString());
    const days = parseInt(Math.floor(totalHours / 24).toString());

    const seconds = parseInt((totalSeconds % 60).toString());
    const minutes = parseInt((totalMinutes % 60).toString());
    const hours = parseInt((totalHours % 24).toString());

    const humanized = [pad(hours), pad(minutes), pad(seconds)];

    let time = "";
    if (days > 0) {
      time = `${days}:${humanized[0]}:${humanized[1]}:${humanized[2]}`;
    } else if (hours > 0) {
      time = `${hours}:${humanized[1]}:${humanized[2]}`;
    } else if (minutes > 0) {
      time = `${minutes}:${humanized[2]}`;
    } else if (seconds > 0) {
      time = `${humanized[2]}`;
    }
    return time;
  }

function pad(value: number): string {
    return value < 10 ? "0" + value : String(value);
}
