// Pairs 0,0,1,1,...,n-1,n-1 with the lone value `single` kept once, in sorted order.
function withSingle(n, single) {
  const values = [];
  for (let v = 0; v < n; v++) values.push(v, ...(v === single ? [] : [v]));
  return values;
}

const singleCases = [
  [[1, 1, 2, 3, 3, 4, 4], 2],
  [[0, 0, 5, 5, 9], 9],
  [[2, 3, 3], 2],
  [[-4, -4, -1, -1, 0, 6, 6], 0],
  [[7], 7],
  [[1, 1, 2, 2, 3], 3],
  [[1, 2, 2, 3, 3], 1],
  [[1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6], 3],
  [[-7, -7, -3, -3, -2, -1, -1], -2],
  [withSingle(1000, 0), 0], // the lone value first among 1999 elements
  [withSingle(1000, 999), 999], // the lone value last
  [withSingle(1000, 617), 617], // the lone value somewhere in the middle
];
for (const [nums, expected] of singleCases) {
  const got = singleNonDuplicate(nums.slice());
  check(got, expected, `nums=${JSON.stringify(nums.slice(0, 8))}${nums.length > 8 ? '...' : ''} (${nums.length} elements)`);
}
