from solution import *

cases = [
    ([1, 10, 100], [1000], 3),
    ([123, 456], [1234, 45], 3),
    ([12], [123, 124, 125], 2),
    ([1, 2, 3], [4, 4, 4], 0),
    ([100000000], [100000000], 9),
    ([5], [5], 1),
    ([7, 77, 777], [7777], 3),
    ([100], [1000, 10], 3),
    ([13, 27], [2, 1], 1),
    ([987654321], [98765, 9876543], 7),
    ([21, 210], [2100, 20], 3),
    (list(range(1, 50001)), [49999], 5),  # 49999 itself is in arr1
    (list(range(1, 50001)), [100000000], 5),  # prefix 10000 is in arr1 but 100000 is not
    ([2 * i for i in range(1, 50001)], [99999999], 4),  # 9999 is a prefix of 99990, but no even number below 100001 starts with 99999
]
for arr1, arr2, expected in cases:
    check(Solution().longestCommonPrefix(list(arr1), list(arr2)), expected, f'arr1={arr1[:5]} (length {len(arr1)}) arr2={arr2[:5]}')
