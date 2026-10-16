import java.util.*;

class Main {
    public static void main(String[] args) {
        List<String> big = new ArrayList<>(), top25 = new ArrayList<>(), all = new ArrayList<>();
        for (int i = 199; i >= 0; i--) // word i appears i % 10 + 1 times
            for (int r = 0; r <= i % 10; r++) big.add(String.format("w%03d", i));
        for (int i = 9; i < 200; i += 10) top25.add(String.format("w%03d", i));
        top25.addAll(Arrays.asList("w008", "w018", "w028", "w038", "w048"));
        for (int f = 10; f >= 1; f--)
            for (int i = f - 1; i < 200; i += 10) all.add(String.format("w%03d", i));
        Object[][] cases = {
            {new String[] {"pear", "apple", "pear", "fig", "apple", "pear"}, 2, Arrays.asList("pear", "apple")},
            {new String[] {"b", "a", "b", "a"}, 2, Arrays.asList("a", "b")},
            {new String[] {"dog", "cat", "dog", "cat", "bird", "bird", "ant"}, 3, Arrays.asList("bird", "cat", "dog")},
            {new String[] {"solo"}, 1, Arrays.asList("solo")},
            {new String[] {"z", "y", "x"}, 1, Arrays.asList("x")},
            {new String[] {"aa", "a", "aaa", "a", "aa"}, 3, Arrays.asList("a", "aa", "aaa")},
            {new String[] {"q", "w", "e", "w"}, 3, Arrays.asList("w", "e", "q")},
            {new String[] {"x", "y", "y", "x", "z"}, 1, Arrays.asList("x")},
            {big.toArray(new String[0]), 25, top25},
            {big.toArray(new String[0]), 200, all},
        };
        for (int n = 0; n < cases.length; n++) {
            String[] words = ((String[]) cases[n][0]).clone();
            int k = (int) cases[n][1];
            List<String> got = new ArrayList<>(new Solution().topKFrequent(words, k));
            Check.eq(got, cases[n][2], "case " + n + " k=" + k);
        }
        Check.done();
    }
}
