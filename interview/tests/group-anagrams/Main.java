import java.util.*;

class Main {
    static List<String> norm(List<List<String>> groups) {
        List<String> out = new ArrayList<>();
        for (List<String> g : groups) {
            List<String> c = new ArrayList<>(g);
            Collections.sort(c);
            out.add(String.join(",", c) + ";");
        }
        Collections.sort(out);
        return out;
    }

    public static void main(String[] args) {
        List<String[]> inputs = new ArrayList<>();
        List<List<List<String>>> expected = new ArrayList<>();
        inputs.add(new String[] {"note", "stone", "tone", "onset", "cat"});
        expected.add(List.of(List.of("note", "tone"), List.of("stone", "onset"), List.of("cat")));
        inputs.add(new String[] {"", "b", ""});
        expected.add(List.of(List.of("", ""), List.of("b")));
        inputs.add(new String[] {"loop"});
        expected.add(List.of(List.of("loop")));
        inputs.add(new String[] {""});
        expected.add(List.of(List.of("")));
        inputs.add(new String[] {"ab", "ab", "ba", "abb"});
        expected.add(List.of(List.of("ab", "ab", "ba"), List.of("abb")));
        inputs.add(new String[] {"aab", "abb", "bab", "aba"});
        expected.add(List.of(List.of("aab", "aba"), List.of("abb", "bab")));
        inputs.add(new String[] {"x", "y", "z"});
        expected.add(List.of(List.of("x"), List.of("y"), List.of("z")));
        // Larger case: 1000 rotations of prefixes of "abcdefghij"; words of equal length are anagrams.
        String[] big = new String[1000];
        List<List<String>> expectedBig = new ArrayList<>();
        for (int n = 0; n < 10; n++) expectedBig.add(new ArrayList<>());
        for (int i = 0; i < 1000; i++) {
            int n = i % 10 + 1, r = (i / 10) % n;
            String base = "abcdefghij".substring(0, n);
            big[i] = base.substring(r) + base.substring(0, r);
            expectedBig.get(n - 1).add(big[i]);
        }
        inputs.add(big);
        expected.add(expectedBig);
        for (int i = 0; i < inputs.size(); i++) {
            List<List<String>> got = new Solution().groupAnagrams(inputs.get(i).clone());
            Check.eq(norm(got), norm(expected.get(i)), Arrays.toString(inputs.get(i)));
        }
        Check.done();
    }
}
