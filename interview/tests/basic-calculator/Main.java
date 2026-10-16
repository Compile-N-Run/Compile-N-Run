import java.util.*;

class Main {
    public static void main(String[] args) {
        String chain = "1" + "+1".repeat(4999); // 1+1+...+1
        String deep = "(".repeat(2000) + "1" + ")".repeat(2000);
        Object[][] cases = {{"12 - 5 + 3", 10}, {"2-(5-6)", 3}, {"(1+(4+5+2)-3)+(6+8)", 23}, {"-(2+3)", -5}, {"1-(2-(3-(4-5)))", 3},
            {"  42  ", 42}, {"(  (7) )", 7}, {"1-(-1)", 2}, {"0", 0}, {"2147483647", 2147483647}, {"10 - 100", -90},
            {"- (3 + (4 + 5))", -12}, {"123+45-678", -510}, {"(0-2147483647)-1", Integer.MIN_VALUE}, {chain, 5000}, {deep, 1},
            {"-" + deep + "+(" + chain + ")", 4999}};
        for (Object[] c : cases) {
            String s = (String) c[0];
            Check.eq(new Solution().calculate(s), c[1], s.substring(0, Math.min(24, s.length())));
        }
        Check.done();
    }
}
