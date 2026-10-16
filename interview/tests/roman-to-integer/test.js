function toRoman(n) {
  let out = "";
  for (const [v, sym] of [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]]) {
    while (n >= v) { out += sym; n -= v; }
  }
  return out;
}
for (const [s, expected] of [["LXXVIII", 78], ["CDXLIV", 444], ["MMXXVI", 2026], ["IX", 9], ["I", 1], ["MMMCMXCIX", 3999],
  ["MMMDCCCLXXXVIII", 3888], ["XLIX", 49]]) {
  check(romanToInt(s), expected, s);
}
for (let n = 1; n < 4000; n++) check(romanToInt(toRoman(n)), n, toRoman(n)); // every valid numeral
