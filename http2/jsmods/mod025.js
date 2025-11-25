// Tiny module 025 — for network request timing experiments.
export const id_025 = 25;
export function work_025() {
  let s = 0;
  for (let j=0;j<50;j++) s += Math.sqrt(j + 25);
  return s;
}
