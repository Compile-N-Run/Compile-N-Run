const mergeCases = [[[2, 5, 9], [4, 10]], [[1, 1], [1]], [[], [-3, 6]], [[7], []], [[4, 5, 6], [1, 2, 3]],
  [[1, 2, 3], [4, 5, 6]], [[-5, 0, 0], [-5, 0]]];
mergeCases.push([Array.from({ length: 1000 }, (_, i) => 2 * i), Array.from({ length: 1000 }, (_, i) => 2 * i - 1)]);
for (const [a, b] of mergeCases) {
  const nums1 = a.concat(new Array(b.length).fill(0));
  merge(nums1, a.length, b.slice(), b.length);
  check(nums1, a.concat(b).sort((x, y) => x - y), `${a.slice(0, 5)} | ${b.slice(0, 5)}`);
}
