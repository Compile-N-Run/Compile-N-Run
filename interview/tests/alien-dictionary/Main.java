import java.util.*;

class Main {
    // True when `order` lists every letter of `words` exactly once and respects every adjacent-pair constraint.
    static boolean validOrder(String[] words, String order) {
        boolean[] letters = new boolean[26], seen = new boolean[26];
        for (String w : words) for (char c : w.toCharArray()) letters[c - 'a'] = true;
        int[] pos = new int[26];
        for (int i = 0; i < order.length(); i++) {
            int c = order.charAt(i) - 'a';
            if (seen[c]) return false;
            seen[c] = true;
            pos[c] = i;
        }
        if (!Arrays.equals(seen, letters)) return false;
        for (int i = 0; i + 1 < words.length; i++) {
            String w1 = words[i], w2 = words[i + 1];
            int k = 0;
            while (k < w1.length() && k < w2.length() && w1.charAt(k) == w2.charAt(k)) k++;
            if (k < w1.length() && k < w2.length()) {
                if (pos[w1.charAt(k) - 'a'] >= pos[w2.charAt(k) - 'a']) return false;
            } else if (w1.length() > w2.length()) {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        // {words, solvable}: any valid order is accepted; an unsolvable list must give "".
        String perm = "qwertyuiopasdfghjklzxcvbnm";
        String[] pairs = new String[26 * 26];
        for (int i = 0; i < 26; i++) for (int j = 0; j < 26; j++) pairs[i * 26 + j] = "" + perm.charAt(i) + perm.charAt(j);
        Object[][] cases = {
            {new String[] {"ba", "bc", "ac", "cab"}, true},
            {new String[] {"zy", "zx"}, true},
            {new String[] {"ab", "abc"}, true},
            {new String[] {"abc", "ab"}, false},
            {new String[] {"q", "w", "q"}, false},
            {new String[] {"wrt", "wrf", "er", "ett", "rftt"}, true},
            {new String[] {"z", "z"}, true},
            {new String[] {"a"}, true},
            {new String[] {"abcxyz"}, true},
            {new String[] {"ac", "ab", "zc", "zb"}, true},
            {new String[] {"ab", "ba", "ab"}, false},
            {new String[] {"abc", "abd", "ab"}, false},
            {new String[] {"z", "y", "x", "w"}, true},
            {pairs, true}, // 676 words that pin down every letter
        };
        for (int n = 0; n < cases.length; n++) {
            String[] words = (String[]) cases[n][0];
            String got = new Solution().alienOrder(words.clone());
            if ((boolean) cases[n][1]) Check.eq(validOrder(words, got), true, "case " + n + ": got \"" + got + "\"");
            else Check.eq(got, "", "case " + n);
        }
        Check.eq(new Solution().alienOrder(pairs.clone()), perm, "full alphabet is unique");
        Check.done();
    }
}
