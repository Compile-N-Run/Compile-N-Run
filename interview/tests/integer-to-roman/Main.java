class Main {
    public static void main(String[] args) {
        Object[][] cases = {{68, "LXVIII"}, {944, "CMXLIV"}, {2026, "MMXXVI"}, {3999, "MMMCMXCIX"}, {1, "I"}, {4, "IV"}, {9, "IX"},
            {40, "XL"}, {1994, "MCMXCIV"}, {3888, "MMMDCCCLXXXVIII"}};
        for (Object[] c : cases) Check.eq(new Solution().intToRoman((int) c[0]), c[1], String.valueOf(c[0]));
        // Larger case: every number in range, against an independent digit-by-digit table.
        String[] th = {"", "M", "MM", "MMM"};
        String[] hu = {"", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"};
        String[] te = {"", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"};
        String[] on = {"", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"};
        for (int n = 1; n < 4000; n++) {
            Check.eq(new Solution().intToRoman(n), th[n / 1000] + hu[n / 100 % 10] + te[n / 10 % 10] + on[n % 10], String.valueOf(n));
        }
        Check.done();
    }
}
