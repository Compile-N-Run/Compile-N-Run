class Main {
    static String toRoman(int n) {
        int[] values = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
        String[] symbols = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < values.length; i++) {
            while (n >= values[i]) { out.append(symbols[i]); n -= values[i]; }
        }
        return out.toString();
    }

    public static void main(String[] args) {
        Object[][] cases = {{"LXXVIII", 78}, {"CDXLIV", 444}, {"MMXXVI", 2026}, {"IX", 9}, {"I", 1}, {"MMMCMXCIX", 3999},
            {"MMMDCCCLXXXVIII", 3888}, {"XLIX", 49}};
        for (Object[] c : cases) Check.eq(new Solution().romanToInt((String) c[0]), c[1], (String) c[0]);
        for (int n = 1; n < 4000; n++) Check.eq(new Solution().romanToInt(toRoman(n)), n, toRoman(n)); // every valid numeral
        Check.done();
    }
}
