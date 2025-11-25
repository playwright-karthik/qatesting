// Tiny module 021 — for network request timing experiments.
export const id_021 = 21;
export function work_021() {
  let s = 0;
  for (let j=0;j<50;j++) s += Math.sqrt(j + 21);
  return s;
}
