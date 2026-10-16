class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 50000; i++) sb.append((char) ('a' + i % 26));
        String bigS = sb.toString();
        String bigT = sb.reverse().toString();
        String bigBad = bigT.substring(0, bigT.length() - 1) + "q";
        Object[][] cases = {{"listen", "silent", true}, {"bell", "bel", false}, {"aab", "abb", false}, {"x", "x", true},
            {"a", "b", false}, {"anagram", "nagaram", true}, {"abc", "abcc", false}, {"zzzz", "zzzz", true},
            {bigS, bigT, true}, {bigS, bigBad, false}};
        for (Object[] c : cases) {
            String s = (String) c[0], t = (String) c[1];
            Check.eq(new Solution().isAnagram(s, t), c[2], s.substring(0, Math.min(20, s.length())) + " " + t.substring(0, Math.min(20, t.length())));
        }
        Check.done();
    }
}
