class Main {
    public static void main(String[] args) {
        Object[][] cases = {{"())((())", 4}, {"(()()", 4}, {"()(())", 6}, {")(", 0}, {"", 0}, {"((((", 0}, {"()(()", 2},
            {")()())()()(", 4}, {"()", 2},
            {"(" + "()".repeat(5000) + "))", 10002}, {"()".repeat(3000) + "(" + "()".repeat(2000), 6000}};
        for (Object[] c : cases) {
            String s = (String) c[0];
            Check.eq(new Solution().longestValidParentheses(s), c[1], "'" + s.substring(0, Math.min(20, s.length())) + "'");
        }
        Check.done();
    }
}
