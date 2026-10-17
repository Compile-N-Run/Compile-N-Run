import java.util.*;

class Main {
    static List<List<String>> lists(String[][] rows) {
        List<List<String>> out = new ArrayList<>();
        for (String[] row : rows) out.add(Arrays.asList(row));
        return out;
    }

    public static void main(String[] args) {
        String[] items = new String[1000];
        for (int i = 0; i < 1000; i++) items[i] = String.format("item%04d", 999 - i);
        String[] firstThree = {"item0000", "item0001", "item0002"};
        Object[][] cases = {
            {new String[] {"banana", "band", "bandana", "bandit", "bank"}, "band", lists(new String[][] {
                {"banana", "band", "bandana"}, {"banana", "band", "bandana"}, {"banana", "band", "bandana"}, {"band", "bandana", "bandit"}})},
            {new String[] {"apple", "apply", "ape"}, "apex", lists(new String[][] {{"ape", "apple", "apply"}, {"ape", "apple", "apply"}, {"ape"}, {}})},
            {new String[] {"cat"}, "dog", lists(new String[][] {{}, {}, {}})},
            {new String[] {"code", "coder", "codes", "coding"}, "code", lists(new String[][] {
                {"code", "coder", "codes"}, {"code", "coder", "codes"}, {"code", "coder", "codes"}, {"code", "coder", "codes"}})},
            {new String[] {"a", "aa", "aaa", "aaaa"}, "aaaa", lists(new String[][] {{"a", "aa", "aaa"}, {"aa", "aaa", "aaaa"}, {"aaa", "aaaa"}, {"aaaa"}})},
            {new String[] {"zebra", "zoo"}, "az", lists(new String[][] {{}, {}})},
            {new String[] {"sun", "sea", "sand", "sugar"}, "s", lists(new String[][] {{"sand", "sea", "sugar"}})},
            {new String[] {"tea", "ten", "team", "teach", "tear", "teal"}, "tean", lists(new String[][] {
                {"tea", "teach", "teal"}, {"tea", "teach", "teal"}, {"tea", "teach", "teal"}, {}})},
            {items, "item0999", lists(new String[][] {firstThree, firstThree, firstThree, firstThree, firstThree,
                {"item0900", "item0901", "item0902"}, {"item0990", "item0991", "item0992"}, {"item0999"}})},
        };
        for (int n = 0; n < cases.length; n++) {
            String[] products = ((String[]) cases[n][0]).clone();
            String word = (String) cases[n][1];
            Check.eq(new Solution().suggestedProducts(products, word), cases[n][2], "case " + n + " \"" + word + "\"");
        }
        Check.done();
    }
}
