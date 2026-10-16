class Main {
    public static void main(String[] args) {
        Object[][] cases = {{"aba", 4}, {"aaaa", 10}, {"abba", 6}, {"abcd", 4}, {"x", 1}, {"racecar", 10}, {"zz", 3},
            {"a".repeat(1000), 500500}, {"ab".repeat(500), 250500}};
        for (Object[] c : cases) {
            String s = (String) c[0];
            Check.eq(new Solution().countSubstrings(s), c[1], s.substring(0, Math.min(20, s.length())));
        }
        Check.done();
    }
}
