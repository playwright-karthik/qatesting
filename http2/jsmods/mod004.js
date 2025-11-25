// Tiny module 004 — for network request timing experiments.
export const id_004 = 4;
export function work_004() {
  let s = 0;
  for (let j=0;j<50;j++) s += Math.sqrt(j + 4);
  return s;
}
