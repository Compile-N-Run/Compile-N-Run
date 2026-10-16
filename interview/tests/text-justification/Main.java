import java.util.*;

class Main {
    public static void main(String[] args) {
        String[] big = new String[101];
        Arrays.fill(big, "abc");
        List<String> bigExpected = new ArrayList<>(Collections.nCopies(50, "abc    abc"));
        bigExpected.add("abc       ");
        Object[][] cases = {
            {new String[] {"ab", "c", "de", "fghij"}, 10, List.of("ab   c  de", "fghij     ")},
            {new String[] {"hello", "extraordinary", "ok"}, 13, List.of("hello        ", "extraordinary", "ok           ")},
            {new String[] {"we", "can", "solve", "this", "one", "line", "at", "a", "time"}, 11,
                List.of("we      can", "solve  this", "one line at", "a time     ")},
            {new String[] {"word"}, 4, List.of("word")},
            {new String[] {"hi"}, 5, List.of("hi   ")},
            {new String[] {"a", "b", "c", "d", "e"}, 3, List.of("a b", "c d", "e  ")},
            {new String[] {"x", "y", "z", "w", "longword"}, 9, List.of("x  y  z w", "longword ")},
            {big, 10, bigExpected}};
        for (int i = 0; i < cases.length; i++) {
            Object[] c = cases[i];
            List<String> got = new Solution().fullJustify(((String[]) c[0]).clone(), (int) c[1]);
            Check.eq(new ArrayList<>(got), new ArrayList<>((List<String>) c[2]), "case " + i);
        }
        Check.done();
    }
}
