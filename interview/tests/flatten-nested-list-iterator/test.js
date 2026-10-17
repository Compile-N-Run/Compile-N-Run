// A number or (nested) array -> NestedInteger.
function buildNested(value) {
  if (typeof value === 'number') return new NestedInteger(value);
  const nested = new NestedInteger();
  for (const item of value) nested.add(buildNested(item));
  return nested;
}
function flattenNested(values) {
  return values.flatMap((item) => (typeof item === 'number' ? [item] : flattenNested(item)));
}
function drainNested(values) {
  const iterator = new NestedIterator(values.map(buildNested));
  const out = [];
  while (iterator.hasNext()) out.push(iterator.next());
  return out;
}

let deepNested = 42;
for (let i = 0; i < 200; i++) deepNested = [deepNested];
const bigNested = [];
for (let i = 0; i < 500; i++) bigNested.push(i, [[i], []]); // 1000 integers, half of them nested
const nestedCases = [
  [[4, 5], 6, [7, [8]]],
  [1, [2, [3, [4, [5]]]]],
  [[], [[]], 9],
  [],
  [[[]]],
  [9],
  [[[[-7]]], 0, [], [3]],
  [[2, 2], 3, [2, 2]],
  bigNested,
  [deepNested], // one integer wrapped in 200 lists
];
for (const values of nestedCases) {
  const label = JSON.stringify(values);
  check(drainNested(values), flattenNested(values), label.length <= 40 ? label : `${label.slice(0, 40)}...`);
}

// hasNext must not consume anything, however often it is called
const nestedIt = new NestedIterator([[], 5].map(buildNested));
check([nestedIt.hasNext(), nestedIt.hasNext(), nestedIt.hasNext()], [true, true, true], '[[],5] hasNext three times');
check(nestedIt.next(), 5, '[[],5] next after repeated hasNext');
check(nestedIt.hasNext(), false, '[[],5] hasNext at the end');
