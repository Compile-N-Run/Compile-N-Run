import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {{"abb", "c*ab*", true}, {"hello", "h.l*o", true}, {"ab", "a", false}, {"aaa", "ab*a", false}, {"abc", ".*", true}, {"", "x*y*", true}, {"", ".", false}, {"a", "ab*", true}, {"xy", ".*z", false}, {"ab", ".*c", false}, {"aaaaaaaaaaaaaaaaaab", "a*a*a*a*a*a*a*c", false}, {"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "a*a*a*a*a*a*a*a*a*a*a", true}, {"mnop", "m.*p.*", true}};
        for (Object[] c : cases) {
            Check.eq(new Solution().isMatch((String) c[0], (String) c[1]), c[2], "\"" + c[0] + "\" \"" + c[1] + "\"");
        }
        Check.done();
    }
}
