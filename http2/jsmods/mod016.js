// Tiny module 016 — for network request timing experiments.
export const id_016 = 16;
export function work_016() {
  let s = 0;
  for (let j=0;j<50;j++) s += Math.sqrt(j + 16);
  return s;
}
