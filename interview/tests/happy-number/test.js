for (const [n, expected] of [[7, true], [4, false], [1, true], [100, true], [2, false], [2147483647, false], [1111111, true], [999999999, false]]) {
  check(isHappy(n), expected, `n=${n}`);
}
{
  // Every number up to 100, compared with the known list of happy numbers.
  const happy = new Set([1, 7, 10, 13, 19, 23, 28, 31, 32, 44, 49, 68, 70, 79, 82, 86, 91, 94, 97, 100]);
  for (let n = 1; n <= 100; n++) check(isHappy(n), happy.has(n), `n=${n}`);
}
