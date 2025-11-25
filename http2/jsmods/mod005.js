// Tiny module 005 — for network request timing experiments.
export const id_005 = 5;
export function work_005() {
  let s = 0;
  for (let j=0;j<50;j++) s += Math.sqrt(j + 5);
  return s;
}
