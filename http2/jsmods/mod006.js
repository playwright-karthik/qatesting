// Tiny module 006 — for network request timing experiments.
export const id_006 = 6;
export function work_006() {
  let s = 0;
  for (let j=0;j<50;j++) s += Math.sqrt(j + 6);
  return s;
}
