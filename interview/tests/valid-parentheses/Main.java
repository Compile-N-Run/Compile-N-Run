class Main {
    public static void main(String[] args) {
        Object[][] cases = {{"([]{})", true}, {"([)]", false}, {"((", false}, {"}", false}, {"()[]{}", true}, {")(", false},
            {"{[()()]}", true}, {"[", false}, {"(]", false}, {"{[(".repeat(3000) + ")]}".repeat(3000), true},
            {"(".repeat(5000) + ")".repeat(4999), false}};
        for (Object[] c : cases) {
            String s = (String) c[0];
            Check.eq(new Solution().isValid(s), c[1], s.substring(0, Math.min(20, s.length())));
        }
        Check.done();
    }
}
