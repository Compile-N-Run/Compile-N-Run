// Each case is a list of [timestamp, message, expected] calls on one Logger.
const loggerCases = [
  [[1, 'start', true], [4, 'stop', true], [10, 'start', false], [11, 'start', true], [13, 'stop', false], [14, 'stop', true]],
  [[0, 'a', true], [5, 'a', false], [9, 'a', false], [10, 'a', true], [19, 'a', false], [20, 'a', true]],
  [[7, 'x', true], [7, 'y', true], [7, 'x', false], [7, 'z', true], [16, 'y', false], [17, 'y', true]],
  [[1000000000, 'only', true]],
  [[1, 'foo', true], [100, 'foo', true], [105, 'bar', true], [109, 'foo', false], [110, 'foo', true]],
  [[3, 'Hi', true], [4, 'hi', true], [5, 'Hi', false], [13, 'Hi', true], [13, 'hi', false], [14, 'hi', true]],
];
const bigCalls = [];
for (let t = 0; t < 10000; t++) {
  bigCalls.push([t, `m${t % 50}`, true]); // each of these repeats every 50 seconds
  bigCalls.push([t, 'same', t % 10 === 0]);
}
loggerCases.push(bigCalls);
loggerCases.forEach((calls, n) => {
  const logger = new Logger();
  calls.forEach(([t, msg, expected], step) => {
    check(logger.shouldPrintMessage(t, msg), expected, `case ${n} step ${step} (${t}, ${msg})`);
  });
});
