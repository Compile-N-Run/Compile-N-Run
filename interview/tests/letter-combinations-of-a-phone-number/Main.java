import java.util.*;

class Main {
    static final String[] LC_KEYS = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

    // Independent iterative reference: extend every prefix by each letter of the next digit.
    static List<String> expand(String digits) {
        if (digits.isEmpty()) return new ArrayList<>();
        List<String> out = new ArrayList<>(List.of(""));
        for (char d : digits.toCharArray()) {
            List<String> next = new ArrayList<>();
            for (String s : out) for (char ch : LC_KEYS[d - '0'].toCharArray()) next.add(s + ch);
            out = next;
        }
        Collections.sort(out);
        return out;
    }

    public static void main(String[] args) {
        Check.eq(expand("29").size(), 12, "count 29");
        Check.eq(expand("7979").size(), 256, "count 7979");
        Object[][] cases = {{"56", List.of("jm", "jn", "jo", "km", "kn", "ko", "lm", "ln", "lo")}, {"7", List.of("p", "q", "r", "s")},
            {"", List.of()}, {"2", List.of("a", "b", "c")}, {"29", expand("29")}, {"99", expand("99")}, {"234", expand("234")},
            {"7979", expand("7979")}};
        for (Object[] c : cases) {
            List<String> got = new ArrayList<>(new Solution().letterCombinations((String) c[0]));
            Collections.sort(got);
            Check.eq(got, c[1], "digits \"" + c[0] + "\"");
        }
        Check.done();
    }
}
