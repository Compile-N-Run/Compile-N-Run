import java.util.*;

class Main {
    static char[][] board(String[] rows) {
        char[][] out = new char[rows.length][];
        for (int i = 0; i < rows.length; i++) out[i] = rows[i].toCharArray();
        return out;
    }

    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {new String[] {"cat", "ore", "dog"}, new String[] {"care", "tar", "code", "god", "cac"}, new String[] {"care", "god", "tar"}},
            new Object[] {new String[] {"ab", "dc"}, new String[] {"ab", "abc", "abcd", "abcda"}, new String[] {"ab", "abc", "abcd"}},
            new Object[] {new String[] {"a"}, new String[] {"a", "b", "aa"}, new String[] {"a"}},
            new Object[] {new String[] {"xyz", "qrs"}, new String[] {"hello"}, new String[] {}},
            new Object[] {new String[] {"aa", "aa"}, new String[] {"aaa", "aaaa", "aaaaa"}, new String[] {"aaa", "aaaa"}},
            new Object[] {new String[] {"tape", "oarn", "pike", "seal"},
                new String[] {"tap", "pan", "pear", "rope", "kin", "ikea", "seal", "lake", "ran", "topi", "tapenade"},
                new String[] {"lake", "seal", "tap", "topi"}},
            new Object[] {new String[] {"cat", "ore", "dog"},
                new String[] {"care", "doge", "code", "cac", "tar", "caterodog", "dog", "god", "rod", "ore"},
                new String[] {"care", "caterodog", "dog", "doge", "god", "ore", "rod", "tar"}},
            new Object[] {new String[] {"abc", "def", "ghi"}, new String[] {"abcfedghi", "abcfi", "adgheb", "ihgfedcba", "bei", "aei"},
                new String[] {"abcfedghi", "abcfi", "adgheb"}}));
        List<String> aWords = new ArrayList<>(), aWant = new ArrayList<>();
        for (int k = 1; k <= 10; k++) { aWords.add("a".repeat(k)); aWant.add("a".repeat(k)); }
        for (int k = 0; k < 10; k++) aWords.add("a".repeat(k) + "b");
        String[] allA = new String[6];
        Arrays.fill(allA, "aaaaaa");
        cases.add(new Object[] {allA, aWords.toArray(new String[0]), aWant.toArray(new String[0])});
        // 12x12 grid; the words walked along rows and columns exist, 2000 pseudo-random words do not.
        String[] grid = new String[12];
        for (int r = 0; r < 12; r++) {
            StringBuilder row = new StringBuilder();
            for (int c = 0; c < 12; c++) row.append((char) ('a' + (r * 7 + c * 3) % 26));
            grid[r] = row.toString();
        }
        List<String> walks = new ArrayList<>();
        for (int r = 0; r < 12; r++) for (int c = 0; c < 3; c++) walks.add(grid[r].substring(c, c + 10));
        for (int c = 0; c < 12; c++) {
            for (int r = 0; r < 3; r++) {
                StringBuilder w = new StringBuilder();
                for (int i = 0; i < 10; i++) w.append(grid[r + i].charAt(c));
                walks.add(w.toString());
            }
        }
        long[] seed = {12345};
        LinkedHashSet<String> bigWords = new LinkedHashSet<>(walks);
        for (int n = 0; n < 2000; n++) {
            seed[0] = seed[0] * 48271 % 2147483647;
            int length = 6 + (int) (seed[0] % 5);
            StringBuilder w = new StringBuilder();
            for (int i = 0; i < length; i++) {
                seed[0] = seed[0] * 48271 % 2147483647;
                w.append((char) ('a' + seed[0] % 26));
            }
            bigWords.add(w.toString());
        }
        String[] walkWant = new TreeSet<>(walks).toArray(new String[0]);
        cases.add(new Object[] {grid, bigWords.toArray(new String[0]), walkWant});
        for (int n = 0; n < cases.size(); n++) {
            List<String> got = new Solution().findWords(board((String[]) cases.get(n)[0]), ((String[]) cases.get(n)[1]).clone());
            Collections.sort(got);
            Check.eq(got, Arrays.asList((String[]) cases.get(n)[2]), "case " + n);
        }
        Check.done();
    }
}
