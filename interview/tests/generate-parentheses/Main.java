import java.util.*;

class Main {
    static boolean valid(String s) {
        int depth = 0;
        for (char ch : s.toCharArray()) {
            depth += ch == '(' ? 1 : -1;
            if (depth < 0) return false;
        }
        return depth == 0;
    }

    public static void main(String[] args) {
        Map<Integer, List<String>> exact = Map.of(1, List.of("()"), 2, List.of("(())", "()()"),
            3, List.of("((()))", "(()())", "(())()", "()(())", "()()()"));
        int[] catalan = {1, 1, 2, 5, 14, 42, 132, 429, 1430};
        for (int n = 1; n <= 8; n++) {
            List<String> got = new ArrayList<>(new Solution().generateParenthesis(n));
            Collections.sort(got);
            String label = "n=" + n;
            if (exact.containsKey(n)) Check.eq(got, exact.get(n), label);
            Check.eq(got.size(), catalan[n], label + " count");
            Check.eq(new HashSet<>(got).size(), got.size(), label + " duplicates");
            boolean ok = true;
            for (String s : got) ok = ok && s.length() == 2 * n && valid(s);
            Check.eq(ok, true, label + " all valid");
        }
        Check.done();
    }
}
