class Main {
    public static void main(String[] args) {
        char[] b = "x".repeat(100000).toCharArray();
        b[10] = 'a'; b[30000] = 'a'; b[30005] = 'c'; b[30010] = 'b';
        String big = new String(b);
        String[][] cases = {{"thequickfox", "qf", "quickf"}, {"abacab", "aab", "aba"}, {"abc", "aa", ""}, {"a", "ab", ""},
            {"a", "a", "a"}, {"Aa", "a", "a"}, {"Aa", "A", "A"}, {"abc", "d", ""}, {"MXNOYXMN", "MN", "MN"},
            {"aaflslflsldkalskaaa", "aaa", "aaa"}, {big, "abc", big.substring(30000, 30011)}};
        for (String[] c : cases) {
            Check.eq(new Solution().minWindow(c[0], c[1]), c[2], c[0].substring(0, Math.min(20, c[0].length())) + " " + c[1]);
        }
        Check.done();
    }
}
