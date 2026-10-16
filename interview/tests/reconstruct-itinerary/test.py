from solution import *

cases = [
    ([['JFK', 'LHR'], ['LHR', 'CDG'], ['CDG', 'JFK'], ['JFK', 'AMS']], ['JFK', 'LHR', 'CDG', 'JFK', 'AMS']),
    ([['JFK', 'KUL'], ['JFK', 'NRT'], ['NRT', 'JFK']], ['JFK', 'NRT', 'JFK', 'KUL']),
    ([['JFK', 'NRT'], ['NRT', 'JFK'], ['JFK', 'NRT']], ['JFK', 'NRT', 'JFK', 'NRT']),
    ([['JFK', 'ZRH']], ['JFK', 'ZRH']),
    ([['JFK', 'SEA'], ['SEA', 'JFK']], ['JFK', 'SEA', 'JFK']),
    ([['JFK', 'AAA'], ['AAA', 'BBB'], ['BBB', 'AAA'], ['AAA', 'CCC']], ['JFK', 'AAA', 'BBB', 'AAA', 'CCC']),
    ([['SFO', 'JFK'], ['JFK', 'SFO'], ['JFK', 'ATL'], ['ATL', 'SFO'], ['SFO', 'ATL']],
     ['JFK', 'ATL', 'SFO', 'JFK', 'SFO', 'ATL']),
    ([['JFK', 'BBB'], ['BBB', 'CCC'], ['CCC', 'BBB'], ['BBB', 'AAA'], ['AAA', 'JFK'], ['JFK', 'DDD']],
     ['JFK', 'BBB', 'CCC', 'BBB', 'AAA', 'JFK', 'DDD']),
]
# A 300-ticket path given in scrambled order, and 150 out-and-back trips from JFK.
codes = ['JFK'] + [chr(65 + i // 26) + chr(65 + i % 26) + 'X' for i in range(300)]
path = [[codes[(k * 7) % 300], codes[(k * 7) % 300 + 1]] for k in range(300)]
cases.append((path, codes))
star, star_want = [], ['JFK']
for i in range(150):
    star += [[codes[1 + i], 'JFK'], ['JFK', codes[1 + i]]]
    star_want += [codes[1 + i], 'JFK']
cases.append((star, star_want))
for tickets, expected in cases:
    check(Solution().findItinerary([list(t) for t in tickets]), expected, f'{tickets[:4]}')
