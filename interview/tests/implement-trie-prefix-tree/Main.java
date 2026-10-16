import java.util.*;

class Main {
    static String word(int i) { // digits of i spelled as letters: 123 -> "wbcd"
        StringBuilder sb = new StringBuilder("w");
        for (char d : String.valueOf(i).toCharArray()) sb.append((char) ('a' + (d - '0')));
        return sb.toString();
    }

    public static void main(String[] args) {
        // Each op is {0, word, 0} for insert, {1, word, expected} for search or {2, prefix, expected} for startsWith.
        List<Object[][]> cases = new ArrayList<>(Arrays.asList(
            new Object[][] {{0, "card", 0}, {1, "card", 1}, {1, "car", 0}, {2, "car", 1}, {0, "car", 0}, {1, "car", 1}, {2, "cat", 0}, {2, "c", 1}, {1, "cards", 0}},
            new Object[][] {{1, "a", 0}, {2, "a", 0}},
            new Object[][] {{0, "a", 0}, {1, "a", 1}, {2, "a", 1}, {1, "aa", 0}, {2, "aa", 0}, {1, "b", 0}, {2, "b", 0}},
            new Object[][] {{0, "zoo", 0}, {0, "zoo", 0}, {1, "zoo", 1}, {1, "zo", 0}, {2, "zoo", 1}, {2, "zoom", 0}},
            new Object[][] {{0, "apple", 0}, {0, "apply", 0}, {0, "ape", 0}, {1, "app", 0}, {2, "app", 1}, {2, "appl", 1}, {1, "apply", 1}, {1, "ape", 1},
                {1, "apes", 0}, {2, "apes", 0}, {2, "b", 0}, {0, "app", 0}, {1, "app", 1}},
            new Object[][] {{0, "abcdefghijklmnopqrstuvwxyz", 0}, {1, "abcdefghijklmnopqrstuvwxyz", 1}, {1, "abcdefghijklmnopqrstuvwxy", 0},
                {2, "abcdefghijklmnopqrstuvwxy", 1}, {0, "z", 0}, {1, "z", 1}, {1, "zz", 0}, {2, "zy", 0}}));
        List<Object[]> big = new ArrayList<>();
        for (int i = 0; i < 2000; i += 2) big.add(new Object[] {0, word(i), 0});
        for (int i = 0; i < 2000; i++) big.add(new Object[] {1, word(i), 1 - i % 2});
        for (int i = 0; i < 200; i++) big.add(new Object[] {2, word(i), 1});
        for (int i = 0; i < 200; i++) big.add(new Object[] {2, word(i) + "z", 0});
        cases.add(big.toArray(new Object[0][]));
        for (int n = 0; n < cases.size(); n++) {
            Trie trie = new Trie();
            Object[][] ops = cases.get(n);
            for (int step = 0; step < ops.length; step++) {
                int op = (int) ops[step][0];
                String s = (String) ops[step][1];
                if (op == 0) trie.insert(s);
                else Check.eq(op == 1 ? trie.search(s) : trie.startsWith(s), (int) ops[step][2] == 1, "case " + n + " step " + step + " op " + op + "(" + s + ")");
            }
        }
        Check.done();
    }
}
