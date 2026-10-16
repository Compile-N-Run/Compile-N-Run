class Main {
    public static void main(String[] args) {
        String alphabet = "abcdefghijklmnopqrstuvwxyz";
        Object[][] cases = {{"xyzxab", 5}, {"abba", 2}, {"zzzz", 1}, {"", 0}, {"a b!a", 4}, {"dvdf", 3}, {"tmmzuxt", 5},
            {"q", 1}, {"01234567890", 10}, {alphabet.repeat(2000), 26}, {"a".repeat(30000) + alphabet, 26}};
        for (Object[] c : cases) {
            String s = (String) c[0];
            Check.eq(new Solution().lengthOfLongestSubstring(s), c[1], "\"" + s.substring(0, Math.min(20, s.length())) + "\"");
        }
        Check.done();
    }
}
