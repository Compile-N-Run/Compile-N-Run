const asteroidCases = [[[4, 9, -6], [4, 9]], [[7, -7], []], [[-3, -1, 2, 5], [-3, -1, 2, 5]], [[3, 5, -8, 2], [-8, 2]],
  [[10, 2, -5], [10]], [[1, -2, -3, 4], [-2, -3, 4]], [[5], [5]], [[-4], [-4]], [[6, 6, -6, -6], []],
  [[...new Array(5000).fill(1), -2], [-2]], [[1000, ...new Array(5000).fill(-1)], [1000]]];
for (const [asteroids, expected] of asteroidCases) {
  check(asteroidCollision([...asteroids]), expected, `size ${asteroids.length} ${asteroids.slice(0, 6)}`);
}
