from solution import *


def digits(n):  # ones digit first
    return [int(d) for d in reversed(str(n))]


big_a, big_b = 10 ** 100 - 1, 1  # 100 nines + 1
big_c = int('1234567890' * 10)
cases = [([2, 1, 5], [8, 4], [0, 6, 5]), ([9, 9], [1], [0, 0, 1]), ([0], [0], [0]), ([3], [4], [7]),
         ([1], [9, 9, 9, 9], [0, 0, 0, 0, 1]), ([5], [5], [0, 1]), ([1, 0, 1], [2, 3], [3, 3, 1]),
         (digits(big_a), digits(big_b), digits(big_a + big_b)), (digits(big_c), digits(big_c), digits(2 * big_c))]
for a, b, expected in cases:
    check(list_values(Solution().addTwoNumbers(build_list(a), build_list(b))), expected, f'{a[:10]} + {b[:10]}')
