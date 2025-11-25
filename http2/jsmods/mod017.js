// Tiny module 017 — for network request timing experiments.
export const id_017 = 17;
export function work_017() {
  let s = 0;
  for (let j=0;j<50;j++) s += Math.sqrt(j + 17);
  return s;
}
