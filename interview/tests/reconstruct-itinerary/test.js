const itineraryCases = [
  [[['JFK', 'LHR'], ['LHR', 'CDG'], ['CDG', 'JFK'], ['JFK', 'AMS']], ['JFK', 'LHR', 'CDG', 'JFK', 'AMS']],
  [[['JFK', 'KUL'], ['JFK', 'NRT'], ['NRT', 'JFK']], ['JFK', 'NRT', 'JFK', 'KUL']],
  [[['JFK', 'NRT'], ['NRT', 'JFK'], ['JFK', 'NRT']], ['JFK', 'NRT', 'JFK', 'NRT']],
  [[['JFK', 'ZRH']], ['JFK', 'ZRH']],
  [[['JFK', 'SEA'], ['SEA', 'JFK']], ['JFK', 'SEA', 'JFK']],
  [[['JFK', 'AAA'], ['AAA', 'BBB'], ['BBB', 'AAA'], ['AAA', 'CCC']], ['JFK', 'AAA', 'BBB', 'AAA', 'CCC']],
  [[['SFO', 'JFK'], ['JFK', 'SFO'], ['JFK', 'ATL'], ['ATL', 'SFO'], ['SFO', 'ATL']],
    ['JFK', 'ATL', 'SFO', 'JFK', 'SFO', 'ATL']],
  [[['JFK', 'BBB'], ['BBB', 'CCC'], ['CCC', 'BBB'], ['BBB', 'AAA'], ['AAA', 'JFK'], ['JFK', 'DDD']],
    ['JFK', 'BBB', 'CCC', 'BBB', 'AAA', 'JFK', 'DDD']],
];
// A 300-ticket path given in scrambled order, and 150 out-and-back trips from JFK.
const codes = ['JFK'];
for (let i = 0; i < 300; i++) codes.push(String.fromCharCode(65 + Math.floor(i / 26), 65 + (i % 26)) + 'X');
const path = [];
for (let k = 0; k < 300; k++) path.push([codes[(k * 7) % 300], codes[((k * 7) % 300) + 1]]);
itineraryCases.push([path, codes]);
const star = [], starWant = ['JFK'];
for (let i = 0; i < 150; i++) {
  star.push([codes[1 + i], 'JFK'], ['JFK', codes[1 + i]]);
  starWant.push(codes[1 + i], 'JFK');
}
itineraryCases.push([star, starWant]);
for (const [tickets, expected] of itineraryCases) {
  check(findItinerary(tickets.map((t) => t.slice())), expected, JSON.stringify(tickets.slice(0, 4)));
}
