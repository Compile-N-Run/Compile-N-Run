import java.util.*;

class Main {
    public static void main(String[] args) {
        List<String> aWords = List.of("a", "aa", "aaa", "aaaa", "aaaaa", "aaaaaaaaaa");
        Object[][] cases = {{"sunflower", List.of("sun", "flower", "flow"), true},
            {"hotdogs", List.of("hot", "dog", "hotdog"), false}, {"abab", List.of("ab"), true},
            {"applepie", List.of("apple", "app", "lepie"), true}, {"a", List.of("b"), false}, {"a", List.of("a"), true},
            {"catcat", List.of("cats", "at"), false}, {"ab", List.of("abc"), false},
            {"a".repeat(299) + "b", aWords, false}, {"a".repeat(300), aWords, true},
            {"ab".repeat(150), List.of("a", "b", "ba"), true}};
        for (int n = 0; n < cases.length; n++) {
            @SuppressWarnings("unchecked")
            List<String> words = new ArrayList<>((List<String>) cases[n][1]);
            Check.eq(new Solution().wordBreak((String) cases[n][0], words), cases[n][2], "case " + n);
        }
        Check.done();
    }
}
