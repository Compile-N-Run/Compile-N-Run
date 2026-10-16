{
  const SAMPLES = 100000;
  // Draw many picks; every index must be valid and frequencies must match the weights.
  // group(i) buckets indexes so long arrays can be checked with fewer samples.
  const checkWeights = (w, group = (i) => i) => {
    const s = new Solution(w.slice());
    const total = w.reduce((a, b) => a + b, 0);
    const expected = new Map(), counts = new Map();
    w.forEach((x, i) => expected.set(group(i), (expected.get(group(i)) || 0) + x / total));
    for (let t = 0; t < SAMPLES; t++) {
      const i = s.pickIndex();
      if (!Number.isInteger(i) || i < 0 || i >= w.length) check(i, 'a valid index', `${w.slice(0, 6)}`);
      counts.set(group(i), (counts.get(group(i)) || 0) + 1);
    }
    for (const [g, p] of expected) {
      const got = (counts.get(g) || 0) / SAMPLES;
      // 6 standard deviations (+ a little slack): a false alarm is about one in a billion,
      // but an off-by-one that moves a whole slot between indexes is still caught.
      const tolerance = 6 * Math.sqrt(p * (1 - p) / SAMPLES) + 0.0005;
      check(Math.abs(got - p) <= tolerance, true, `${w.slice(0, 6)} group ${g}: expected ${p}, got ${got}`);
    }
  };

  checkWeights([2, 5, 3]);
  const s = new Solution([7]);
  for (let t = 0; t < 100; t++) check(s.pickIndex(), 0, 'single weight');
  checkWeights([1, 1, 1, 1]);
  checkWeights([1, 99]);
  checkWeights([100000, 1, 100000]);
  checkWeights([5, 1, 1, 1, 1, 1, 1, 1, 1, 5]);
  // Larger case: 10000 weights up to 100000, checked in 10 buckets.
  checkWeights(Array.from({ length: 10000 }, (_, i) => (i * 7919) % 100000 + 1), (i) => i % 10);
}
