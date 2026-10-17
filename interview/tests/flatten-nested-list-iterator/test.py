from solution import *


def build(value):
    """A Python int or (nested) list -> NestedInteger."""
    if isinstance(value, int):
        return NestedInteger(value)
    nested = NestedInteger()
    for item in value:
        nested.add(build(item))
    return nested


def flatten(values):
    return [v for item in values for v in ([item] if isinstance(item, int) else flatten(item))]


def drain(values):
    iterator = NestedIterator([build(item) for item in values])
    out = []
    while iterator.hasNext():
        out.append(iterator.next())
    return out


deep = 42
for _ in range(200):
    deep = [deep]
cases = [
    [[4, 5], 6, [7, [8]]],
    [1, [2, [3, [4, [5]]]]],
    [[], [[]], 9],
    [],
    [[[]]],
    [9],
    [[[[-7]]], 0, [], [3]],
    [[2, 2], 3, [2, 2]],
    [x for i in range(500) for x in (i, [[i], []])],  # 1000 integers, half of them nested
    [deep],  # one integer wrapped in 200 lists
]
for values in cases:
    label = str(values)
    check(drain(values), flatten(values), label if len(label) <= 40 else label[:40] + '...')

# hasNext must not consume anything, however often it is called
iterator = NestedIterator([build(item) for item in [[], 5]])
check([iterator.hasNext(), iterator.hasNext(), iterator.hasNext()], [True, True, True], '[[], 5] hasNext three times')
check(iterator.next(), 5, '[[], 5] next after repeated hasNext')
check(iterator.hasNext(), False, '[[], 5] hasNext at the end')
