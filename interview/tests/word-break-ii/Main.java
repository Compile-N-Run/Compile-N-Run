import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {
            {"icecreamcone", List.of("ice", "cream", "cone", "icecream"), List.of("ice cream cone", "icecream cone")},
            {"sunflowerpot", List.of("sun", "flower", "pot", "flow", "erpot"), List.of("sun flow erpot", "sun flower pot")},
            {"hotdogs", List.of("hot", "dog", "hotdog"), List.of()},
            {"a", List.of("a"), List.of("a")},
            {"a", List.of("b"), List.of()},
            {"aaa", List.of("a", "aa"), List.of("a a a", "a aa", "aa a")},
            {"abab", List.of("ab", "abab", "a", "b"), List.of("a b a b", "a b ab", "ab a b", "ab ab", "abab")},
            {"a".repeat(25) + "b", List.of("a", "aa", "aaa"), List.of()}};
        for (int n = 0; n < cases.length; n++) {
            @SuppressWarnings("unchecked")
            List<String> words = new ArrayList<>((List<String>) cases[n][1]);
            List<String> got = new ArrayList<>(new Solution().wordBreak((String) cases[n][0], words));
            Collections.sort(got);
            Check.eq(got, cases[n][2], "case " + n + ": " + cases[n][0]);
        }

        // Larger case: 'a' * 12 with pieces of 1-3 letters has 927 sentences (a tribonacci number).
        String big = "a".repeat(12);
        List<String> bigWords = List.of("a", "aa", "aaa");
        List<String> got = new Solution().wordBreak(big, new ArrayList<>(bigWords));
        Check.eq(got.size(), 927, "count " + big);
        Check.eq(new HashSet<>(got).size(), 927, "distinct " + big);
        boolean all = true;
        for (String sentence : got) {
            all &= sentence.replace(" ", "").equals(big) && bigWords.containsAll(Arrays.asList(sentence.split(" ")));
        }
        Check.eq(all, true, "each sentence spells s " + big);
        Check.done();
    }
}
