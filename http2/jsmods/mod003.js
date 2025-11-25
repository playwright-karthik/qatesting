// Tiny module 003 — for network request timing experiments.
export const id_003 = 3;
export function work_003() {
  let s = 0;
  for (let j=0;j<50;j++) s += Math.sqrt(j + 3);
  return s;
}
