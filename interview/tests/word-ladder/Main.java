import java.util.*;

class Main {
    public static void main(String[] args) {
        List<String> big = new ArrayList<>();
        for (char a = 'a'; a <= 'j'; a++)
            for (char b = 'a'; b <= 'j'; b++)
                for (char c = 'a'; c <= 'j'; c++) big.add("" + a + b + c);
        Object[][] cases = {
            {"cat", "dog", List.of("cot", "cog", "dog", "bat"), 4},
            {"cold", "warm", List.of("cord", "card", "ward", "warm", "worm"), 5},
            {"cat", "dog", List.of("cot", "cog", "bat"), 0},
            {"a", "c", List.of("a", "b", "c"), 2},
            {"hot", "dog", List.of("hot", "dog"), 0},
            {"lost", "cost", List.of("most", "fist", "lost", "cost", "fish"), 2},
            {"abc", "xyz", List.of("abd", "xyz"), 0},
            {"aaa", "jjj", big, 4}};
        for (Object[] c : cases) {
            @SuppressWarnings("unchecked")
            List<String> words = new ArrayList<>((List<String>) c[2]);
            Check.eq(new Solution().ladderLength((String) c[0], (String) c[1], words), c[3], c[0] + " -> " + c[1]);
        }
        Check.done();
    }
}
