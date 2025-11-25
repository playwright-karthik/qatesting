// Tiny module 013 — for network request timing experiments.
export const id_013 = 13;
export function work_013() {
  let s = 0;
  for (let j=0;j<50;j++) s += Math.sqrt(j + 13);
  return s;
}
