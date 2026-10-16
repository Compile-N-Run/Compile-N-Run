const bigGas = new Array(1000).fill(1), bigCost = new Array(1000).fill(1);
bigGas[700] = 2; bigCost[699] = 2;
for (const [gas, cost, expected] of [[[2, 5, 1, 4], [3, 2, 4, 1], 1], [[1, 1, 1], [2, 1, 1], -1], [[0, 0, 7], [2, 3, 2], 2],
  [[3], [3], 0], [[5], [6], -1], [[4, 0, 2], [1, 3, 2], 0], [bigGas, bigCost, 700]]) {
  check(canCompleteCircuit(gas.slice(), cost.slice()), expected, `${gas.slice(0, 6)} ${cost.slice(0, 6)}`);
}
