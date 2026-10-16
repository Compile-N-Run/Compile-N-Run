{
  // Each op is [0, account, 0, money, expected] for deposit, [1, account, 0, money, expected] for withdraw
  // or [2, account1, account2, money, expected] for transfer.
  const cases = [
    [[10, 100, 20, 50, 30], [[1, 3, 0, 10, 1], [2, 5, 1, 20, 1], [0, 5, 0, 20, 1], [2, 3, 4, 15, 0], [1, 10, 0, 50, 0],
      [1, 1, 0, 30, 1], [1, 5, 0, 30, 1], [1, 2, 0, 101, 0]]],
    [[0], [[0, 1, 0, 5, 1], [1, 1, 0, 5, 1], [1, 1, 0, 1, 0], [2, 1, 2, 1, 0], [0, 0, 0, 5, 0], [0, 2, 0, 5, 0], [1, 1, 0, 1, 0]]],
    [[7], [[1, 1, 0, 8, 0], [1, 1, 0, 7, 1], [1, 1, 0, 7, 0]]],
    [[5, 0], [[2, 2, 1, 1, 0], [2, 1, 2, 5, 1], [2, 1, 2, 1, 0], [1, 2, 0, 5, 1], [1, 1, 0, 1, 0]]],
    [[5000000000000, 1], [[1, 1, 0, 4000000000000, 1], [2, 1, 2, 1000000000000, 1], [1, 1, 0, 1, 0],
      [1, 2, 0, 1000000000001, 1], [1, 2, 0, 1, 0], [0, 2, 0, 9999999999999, 1], [1, 2, 0, 9999999999999, 1]]],
    [[10, 10], [[2, 1, 2, 11, 0], [2, 1, 3, 5, 0], [2, 0, 2, 5, 0], [1, 1, 0, 10, 1], [1, 2, 0, 10, 1], [2, 1, 2, 1, 0]]],
  ];
  const big = [];
  for (let i = 1; i <= 1000; i++) big.push([0, i, 0, i, 1]);
  for (let i = 1; i < 1000; i++) big.push([2, i, i + 1, 1000 + i, 1]);
  for (let i = 2; i < 1000; i++) big.push([1, i, 0, 999 + i, 1]);
  for (let i = 1; i < 1000; i++) big.push([1, i, 0, 1, 0]);
  big.push([1, 1000, 0, 3999, 1], [1, 1000, 0, 1, 0]);
  cases.push([new Array(1000).fill(1000), big]);
  cases.forEach(([balance, ops], n) => {
    const bank = new Bank(balance.slice());
    ops.forEach(([op, a, b, money, expected], step) => {
      const got = op === 0 ? bank.deposit(a, money) : op === 1 ? bank.withdraw(a, money) : bank.transfer(a, b, money);
      check(got, expected === 1, `case ${n} step ${step} op ${op}(${a}, ${b}, ${money})`);
    });
  });
}
