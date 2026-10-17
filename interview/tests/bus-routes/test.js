const busCases = [
  [[[10, 20, 30], [30, 40, 50]], 10, 50, 2],
  [[[1, 2, 3]], 1, 3, 1],
  [[[1, 2], [3, 4]], 1, 4, -1],
  [[[5, 6]], 5, 5, 0],
  [[[1, 2, 3, 4, 5], [2, 10], [5, 10]], 1, 10, 2],
  [[[1, 2, 3], [3, 4]], 1, 3, 1],
  [[[1, 9], [2, 3, 8], [4], [8, 11], [5, 9, 10]], 8, 9, -1],
  [[[1, 2], [2, 3], [3, 4], [4, 5]], 1, 5, 4],
  [[[7, 8]], 1, 8, -1], // source is not on any route
];
const chain = [], star = [], longRoutes = [];
for (let i = 0; i < 500; i++) chain.push([i, i + 1]);
for (let i = 1; i <= 1000; i++) star.push([0, i]);
for (let i = 0; i < 50000; i += 500) longRoutes.push(Array.from({ length: 1000 }, (_, k) => i + k));
busCases.push([chain, 0, 500, 500]); // a chain of 500 buses
busCases.push([star, 1, 1000, 2]); // a star: every route passes the hub 0
busCases.push([longRoutes, 0, 49999 + 500, 100]); // long overlapping routes
for (const [routes, source, target, expected] of busCases) {
  const got = numBusesToDestination(routes.map((r) => r.slice()), source, target);
  check(got, expected, `${routes.length} routes ${JSON.stringify(routes).slice(0, 40)} ${source}->${target}`);
}
