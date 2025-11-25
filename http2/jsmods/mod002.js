// Tiny module 002 — for network request timing experiments.
export const id_002 = 2;
export function work_002() {
  let s = 0;
  for (let j=0;j<50;j++) s += Math.sqrt(j + 2);
  return s;
}
