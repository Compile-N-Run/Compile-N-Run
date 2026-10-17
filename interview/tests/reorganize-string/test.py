from solution import *


def verdict(s, got):
    """'ok' when got is a valid rearrangement of s (or '' when none exists); otherwise what went wrong."""
    possible = max(Counter(s).values()) <= (len(s) + 1) // 2
    if got == '':
        return 'ok' if not possible else 'empty, but an arrangement exists'
    if not possible:
        return 'not empty, but no arrangement exists'
    if sorted(got) != sorted(s):
        return 'letters differ from the input'
    if any(got[i] == got[i + 1] for i in range(len(got) - 1)):
        return 'two equal letters are adjacent'
    return 'ok'


cases = [
    'aab',
    'aaab',
    'vvvlo',
    'a',
    'aa',
    'ab',
    'aabb',
    'aaabbc',
    'aaaabbbccd',
    'zzzzzzyyyyxxww',
    'abcdefghijklmnopqrstuvwxyz',
    'a' * 250 + 'b' * 150 + 'c' * 100,  # 500 letters, exactly half of them a
    'a' * 251 + 'b' * 249,  # impossible by one letter
]
for s in cases:
    got = Solution().reorganizeString(s)
    label = s if len(s) <= 30 else f'{s[:12]}... ({len(s)} letters)'
    check(verdict(s, got), 'ok', f'"{label}" -> "{got if len(got) <= 30 else got[:12] + "..."}"')
