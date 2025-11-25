// Tiny module 012 — for network request timing experiments.
export const id_012 = 12;
export function work_012() {
  let s = 0;
  for (let j=0;j<50;j++) s += Math.sqrt(j + 12);
  return s;
}
