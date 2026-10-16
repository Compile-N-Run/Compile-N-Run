from solution import *

# 1. The write-up's example.
s = RandomizedSet()
check(s.insert(4), True, 'insert 4')
check(s.insert(4), False, 'insert 4 again')
check(s.insert(-2), True, 'insert -2')
check(s.getRandom() in (4, -2), True, 'random of {4,-2}')
check(s.remove(4), True, 'remove 4')
check(s.remove(4), False, 'remove 4 again')
check(s.getRandom(), -2, 'only -2 left')

# 2. Empty set, single element, re-insert after removal.
s = RandomizedSet()
check(s.remove(0), False, 'remove from empty')
check(s.insert(0), True, 'insert 0')
check(s.getRandom(), 0, 'single 0')
check(s.remove(0), True, 'remove 0')
check(s.insert(0), True, 're-insert 0')

# 3. 32-bit limits and removing the last array element.
s = RandomizedSet()
check(s.insert(-2**31), True, 'insert min')
check(s.insert(2**31 - 1), True, 'insert max')
check(s.remove(2**31 - 1), True, 'remove max (last slot)')
check(s.getRandom(), -2**31, 'only min left')

# 4. Every member is returned at least once, and nothing else.
s = RandomizedSet()
members = set(range(-5, 5))
for v in members:
    s.insert(v)
seen = set()
for _ in range(2000):
    r = s.getRandom()
    check(r in members, True, f'{r} is a member')
    seen.add(r)
check(seen, members, 'all members returned')

# 5. Larger case: insert 0..9999, remove the even numbers.
s = RandomizedSet()
for v in range(10000):
    check(s.insert(v), True, f'insert {v}')
for v in range(0, 10000, 2):
    check(s.remove(v), True, f'remove {v}')
for v in range(0, 10000, 2):
    check(s.remove(v), False, f'remove {v} again')
for _ in range(1000):
    check(s.getRandom() % 2, 1, 'only odd values left')

# 6. Random operations compared with a reference set.
s, model, state = RandomizedSet(), set(), 12345
for step in range(20000):
    state = (state * 1103515245 + 12345) % 2**31
    op, v = state % 3, (state >> 8) % 50
    if op == 0:
        check(s.insert(v), v not in model, f'step {step} insert {v}')
        model.add(v)
    elif op == 1:
        check(s.remove(v), v in model, f'step {step} remove {v}')
        model.discard(v)
    elif model:
        check(s.getRandom() in model, True, f'step {step} getRandom')
