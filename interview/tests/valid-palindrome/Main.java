class Main {
    public static void main(String[] args) {
        String half = "Ab1, ".repeat(20000);
        String rev = new StringBuilder(half).reverse().toString();
        Object[][] cases = {{"Step on no pets!", true}, {"Top spot 1", false}, {"?! .", true}, {"ab2a", false}, {"a", true},
            {"Aa", true}, {"0P", false}, {"No 'x' in Nixon", true}, {half + "#" + rev, true}, {half + "x" + rev + "z", false}};
        for (Object[] c : cases) {
            String s = (String) c[0];
            Check.eq(new Solution().isPalindrome(s), c[1], s.substring(0, Math.min(30, s.length())));
        }
        Check.done();
    }
}
