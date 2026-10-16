from solution import *

SAMPLES = 100000


def check_weights(w, group=None):
    """Draw many picks; every index must be valid and frequencies must match the weights.
    group(i) optionally buckets indexes so long arrays can be checked with fewer samples."""
    group = group or (lambda i: i)
    s, total = Solution(list(w)), sum(w)
    expected, counts = defaultdict(float), defaultdict(int)
    for i, x in enumerate(w):
        expected[group(i)] += x / total
    for _ in range(SAMPLES):
        i = s.pickIndex()
        if not (isinstance(i, int) and 0 <= i < len(w)):
            raise AssertionError(f'{w[:6]}: invalid index {i!r}')
        counts[group(i)] += 1
    for g, p in expected.items():
        # 6 standard deviations (+ a little slack): a false alarm is about one in a billion,
        # but an off-by-one that moves a whole slot between indexes is still caught.
        tolerance = 6 * math.sqrt(p * (1 - p) / SAMPLES) + 0.0005
        check(abs(counts[g] / SAMPLES - p) <= tolerance, True,
              f'{w[:6]} group {g}: expected {p:.4f}, got {counts[g] / SAMPLES:.4f}')


check_weights([2, 5, 3])
s = Solution([7])
for _ in range(100):
    check(s.pickIndex(), 0, 'single weight')
check_weights([1, 1, 1, 1])
check_weights([1, 99])
check_weights([100000, 1, 100000])
check_weights([5, 1, 1, 1, 1, 1, 1, 1, 1, 5])
# Larger case: 10000 weights up to 100000, checked in 10 buckets.
check_weights([(i * 7919) % 100000 + 1 for i in range(10000)], group=lambda i: i % 10)
