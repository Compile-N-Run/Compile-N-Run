class Main {
    public static void main(String[] args) {
        String big = "7*3/2" + "+7*3/2".repeat(4999); // 5000 terms of 10
        Object[][] cases = {{"3+4*2", 11}, {" 20 / 3 - 1 ", 5}, {"8-6/4*3", 5}, {"42", 42}, {"3-5/2", 1}, {"14-3/2", 13}, {"1-1+1", 1},
            {"0*7", 0}, {"2*3*4/5", 4}, {"  2147483647 ", 2147483647}, {"100 - 99 - 1", 0}, {big, 50000}};
        for (Object[] c : cases) {
            String s = (String) c[0];
            Check.eq(new Solution().calculate(s), c[1], s.substring(0, Math.min(20, s.length())));
        }
        Check.done();
    }
}
