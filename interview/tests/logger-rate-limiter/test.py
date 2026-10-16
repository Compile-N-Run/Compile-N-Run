from solution import *

# Each case is a list of (timestamp, message, expected) calls on one Logger.
cases = [
    [(1, 'start', True), (4, 'stop', True), (10, 'start', False), (11, 'start', True), (13, 'stop', False), (14, 'stop', True)],
    [(0, 'a', True), (5, 'a', False), (9, 'a', False), (10, 'a', True), (19, 'a', False), (20, 'a', True)],
    [(7, 'x', True), (7, 'y', True), (7, 'x', False), (7, 'z', True), (16, 'y', False), (17, 'y', True)],
    [(1000000000, 'only', True)],
    [(1, 'foo', True), (100, 'foo', True), (105, 'bar', True), (109, 'foo', False), (110, 'foo', True)],
    [(3, 'Hi', True), (4, 'hi', True), (5, 'Hi', False), (13, 'Hi', True), (13, 'hi', False), (14, 'hi', True)],
]
big = []
for t in range(10000):
    big.append((t, f'm{t % 50}', True))  # each of these repeats every 50 seconds
    big.append((t, 'same', t % 10 == 0))
cases.append(big)
for n, calls in enumerate(cases):
    logger = Logger()
    for step, (t, msg, expected) in enumerate(calls):
        check(logger.shouldPrintMessage(t, msg), expected, f'case {n} step {step} ({t}, {msg!r})')
