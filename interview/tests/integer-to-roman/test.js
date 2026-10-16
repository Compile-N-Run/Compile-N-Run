{
  for (const [num, expected] of [[68, "LXVIII"], [944, "CMXLIV"], [2026, "MMXXVI"], [3999, "MMMCMXCIX"], [1, "I"], [4, "IV"],
    [9, "IX"], [40, "XL"], [1994, "MCMXCIV"], [3888, "MMMDCCCLXXXVIII"]]) {
    check(intToRoman(num), expected, `${num}`);
  }
  // Larger case: every number in range, against an independent digit-by-digit table.
  const TH = ["", "M", "MM", "MMM"];
  const HU = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"];
  const TE = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"];
  const ON = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
  for (let n = 1; n < 4000; n++) {
    check(intToRoman(n), TH[Math.floor(n / 1000)] + HU[Math.floor(n / 100) % 10] + TE[Math.floor(n / 10) % 10] + ON[n % 10], `${n}`);
  }
}
