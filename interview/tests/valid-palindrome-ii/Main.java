import java.util.*;

class Main {
    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {"abca", true},
            new Object[] {"acba", true},
            new Object[] {"abc", false},
            new Object[] {"racecar", true},
            new Object[] {"abcdba", true},
            new Object[] {"a", true},
            new Object[] {"ab", true},
            new Object[] {"aba", true},
            new Object[] {"abba", true},
            new Object[] {"abcca", true},
            new Object[] {"accba", true},
            new Object[] {"abcdedcbaq", true},
            new Object[] {"xabcdedcby", false},
            new Object[] {"deeee", true},
            new Object[] {"eedcfee", false},
            new Object[] {"compilexnrunnurnelipmoc", true},
            new Object[] {"compilexnrunnurnelipmyoc", false}));
        String half = "ab".repeat(2500);
        String mirror = half + new StringBuilder(half).reverse(); // a 10,000-character palindrome
        cases.add(new Object[] {mirror, true});
        cases.add(new Object[] {half + "z" + new StringBuilder(half).reverse(), true});
        cases.add(new Object[] {"z" + mirror, true});
        cases.add(new Object[] {mirror + "z", true});
        cases.add(new Object[] {"ab".repeat(5000), true});
        cases.add(new Object[] {mirror.substring(0, 2500) + "zq" + mirror.substring(2500), false});
        cases.add(new Object[] {mirror.substring(0, 100) + "z" + mirror.substring(100, 200) + "q" + mirror.substring(200), false});
        for (int n = 0; n < cases.size(); n++) {
            String s = (String) cases.get(n)[0];
            String label = s.length() <= 40 ? s : s.substring(0, 12) + "..." + s.substring(s.length() - 12) + " (" + s.length() + " chars)";
            Check.eq(new Solution().validPalindrome(s), cases.get(n)[1], "case " + n + " " + label);
        }
        Check.done();
    }
}
