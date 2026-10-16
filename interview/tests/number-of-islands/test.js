const full = [], board = [];
for (let r = 0; r < 300; r++) {
  full.push("1".repeat(300));
  let row = "";
  for (let c = 0; c < 300; c++) row += (r + c) % 2 === 0 ? "1" : "0";
  board.push(row);
}
for (const [rows, expected] of [[["110", "010", "001"], 2], [["101", "010", "101"], 5], [["000"], 0],
  [["1111", "1001", "1111"], 1], [["1"], 1], [["10", "01", "10"], 3], [["1", "1", "0", "1"], 2], [full, 1], [board, 45000]]) {
  check(numIslands(rows.map((row) => row.split(""))), expected, JSON.stringify(rows.slice(0, 3)));
}
