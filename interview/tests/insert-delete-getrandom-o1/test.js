{
  // 1. The write-up's example.
  let s = new RandomizedSet();
  check(s.insert(4), true, 'insert 4');
  check(s.insert(4), false, 'insert 4 again');
  check(s.insert(-2), true, 'insert -2');
  check([4, -2].includes(s.getRandom()), true, 'random of {4,-2}');
  check(s.remove(4), true, 'remove 4');
  check(s.remove(4), false, 'remove 4 again');
  check(s.getRandom(), -2, 'only -2 left');

  // 2. Empty set, single element, re-insert after removal.
  s = new RandomizedSet();
  check(s.remove(0), false, 'remove from empty');
  check(s.insert(0), true, 'insert 0');
  check(s.getRandom(), 0, 'single 0');
  check(s.remove(0), true, 'remove 0');
  check(s.insert(0), true, 're-insert 0');

  // 3. 32-bit limits and removing the last array element.
  s = new RandomizedSet();
  check(s.insert(-2147483648), true, 'insert min');
  check(s.insert(2147483647), true, 'insert max');
  check(s.remove(2147483647), true, 'remove max (last slot)');
  check(s.getRandom(), -2147483648, 'only min left');

  // 4. Every member is returned at least once, and nothing else.
  s = new RandomizedSet();
  const members = new Set();
  for (let v = -5; v < 5; v++) { members.add(v); s.insert(v); }
  const seen = new Set();
  for (let t = 0; t < 2000; t++) {
    const r = s.getRandom();
    check(members.has(r), true, `${r} is a member`);
    seen.add(r);
  }
  check(seen.size, members.size, 'all members returned');

  // 5. Larger case: insert 0..9999, remove the even numbers.
  s = new RandomizedSet();
  for (let v = 0; v < 10000; v++) check(s.insert(v), true, `insert ${v}`);
  for (let v = 0; v < 10000; v += 2) check(s.remove(v), true, `remove ${v}`);
  for (let v = 0; v < 10000; v += 2) check(s.remove(v), false, `remove ${v} again`);
  for (let t = 0; t < 1000; t++) check(s.getRandom() % 2, 1, 'only odd values left');

  // 6. Random operations compared with a reference set.
  s = new RandomizedSet();
  const model = new Set();
  let state = 12345n;
  for (let step = 0; step < 20000; step++) {
    state = (state * 1103515245n + 12345n) % 2147483648n;
    const op = Number(state % 3n), v = Number((state >> 8n) % 50n);
    if (op === 0) { check(s.insert(v), !model.has(v), `step ${step} insert ${v}`); model.add(v); }
    else if (op === 1) { check(s.remove(v), model.has(v), `step ${step} remove ${v}`); model.delete(v); }
    else if (model.size) check(model.has(s.getRandom()), true, `step ${step} getRandom`);
  }
}
