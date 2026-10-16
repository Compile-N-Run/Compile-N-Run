const half = "Ab1, ".repeat(20000);
const rev = half.split("").reverse().join("");
for (const [s, expected] of [["Step on no pets!", true], ["Top spot 1", false], ["?! .", true], ["ab2a", false], ["a", true],
  ["Aa", true], ["0P", false], ["No 'x' in Nixon", true], [half + "#" + rev, true], [half + "x" + rev + "z", false]]) {
  check(isPalindrome(s), expected, JSON.stringify(s.slice(0, 30)));
}
