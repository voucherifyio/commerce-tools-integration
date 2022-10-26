export function elapsedTime(start: number, end: number): string {
  return `Time: ${(end - start).toFixed(3)}ms`;
}
