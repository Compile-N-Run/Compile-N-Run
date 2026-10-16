{
  const byList = (a, b) => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
    return a.length - b.length;
  };
  const normalise = (lists) => lists.map((s) => s.slice().sort((a, b) => a - b)).sort(byList);
  const three = [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]];
  const exact = [
    [[1, 2, 3], three],
    [[3, 1, 2], three],
    [[], [[]]],
    [[0], [[], [0]]],
    [[-1, 4], [[], [-1], [-1, 4], [4]]],
    [[5, -2, 7, 0], [[], [-2], [-2, 0], [-2, 0, 5], [-2, 0, 5, 7], [-2, 0, 7], [-2, 5], [-2, 5, 7], [-2, 7],
      [0], [0, 5], [0, 5, 7], [0, 7], [5], [5, 7], [7]]],
  ];
  for (const [nums, expected] of exact) {
    check(normalise(subsets(nums.slice())), expected, `${JSON.stringify(nums)}`);
  }
  // Larger inputs: 2^n distinct subsets, each made of distinct elements of nums.
  const ten = [], twelve = [];
  for (let i = 1; i <= 10; i++) ten.push(i);
  for (let i = -6; i < 6; i++) twelve.push(i);
  for (const nums of [ten, twelve]) {
    const got = subsets(nums.slice());
    const want = 2 ** nums.length;
    check(got.length, want, `count for ${nums}`);
    const seen = new Set(normalise(got).map((s) => JSON.stringify(s)));
    check(seen.size, want, `distinct for ${nums}`);
    for (const s of got) {
      check(new Set(s).size === s.length && s.every((v) => nums.includes(v)), true, `${nums}: invalid subset ${JSON.stringify(s)}`);
    }
  }
}
