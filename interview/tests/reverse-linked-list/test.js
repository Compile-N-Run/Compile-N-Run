const bigList = [];
for (let v = -2500; v < 2500; v++) bigList.push(v);
for (const values of [[1, 2, 3, 4], [8, 5], [7], [], [3, 3, 1], [-5, 0, 5, -5], bigList]) {
  check(listValues(reverseList(buildList(values))), values.slice().reverse(), `${values.slice(0, 10)}`);
}
