// [x, n, expected]; results are compared with a tolerance because rounding differs between methods.
const powCases = [
  [3.0, 4, 81.0],
  [2.0, -3, 0.125],
  [-1.5, 7, -17.0859375],
  [5.5, 0, 1.0],
  [2.0, -2147483648, 0.0],
  [2.0, 10, 1024.0],
  [2.1, 3, 9.261],
  [0.5, 3, 0.125],
  [0.0, 5, 0.0],
  [0.0, 0, 1.0],
  [1.0, 2147483647, 1.0],
  [-1.0, 2147483647, -1.0],
  [-1.0, -2147483648, 1.0],
  [2.0, -30, 9.313225746154785e-10],
  [1.5, 40, 11057332.320940012],
  [1.00001, 123456, 3.4368447520907104],
  [1.0000001, 2147483647, 1.8366448196907325e93],
  [0.9999999, 2147483647, 5.444595237395887e-94],
];
for (const [x, n, expected] of powCases) {
  const got = myPow(x, n);
  const close = Math.abs(got - expected) <= 1e-6 * Math.max(1, Math.abs(expected));
  check(close, true, `myPow(${x}, ${n}): expected ${expected}, got ${got}`);
}
