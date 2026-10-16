const big = Array(101).fill("abc");
const bigExpected = Array(50).fill("abc    abc").concat(["abc       "]);
for (const [words, width, expected] of [
  [["ab", "c", "de", "fghij"], 10, ["ab   c  de", "fghij     "]],
  [["hello", "extraordinary", "ok"], 13, ["hello        ", "extraordinary", "ok           "]],
  [["we", "can", "solve", "this", "one", "line", "at", "a", "time"], 11, ["we      can", "solve  this", "one line at", "a time     "]],
  [["word"], 4, ["word"]],
  [["hi"], 5, ["hi   "]],
  [["a", "b", "c", "d", "e"], 3, ["a b", "c d", "e  "]],
  [["x", "y", "z", "w", "longword"], 9, ["x  y  z w", "longword "]],
  [big, 10, bigExpected],
]) {
  check(fullJustify(words.slice(), width), expected, `${words.slice(0, 5)} ${width}`);
}
