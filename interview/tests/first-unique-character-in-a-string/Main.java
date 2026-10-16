import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {{"stress", 1}, {"racecar", 3}, {"aabbcc", -1}, {"x", 0}, {"zzyzx", 2}, {"abcabc", -1}, {"abba", -1},
            {"zza", 2}, {"abcdefghijklmnopqrstuvwxyz", 0}, {"ab".repeat(5000) + "q", 10000}, {"a".repeat(100000), -1},
            {"q" + "ab".repeat(5000), 0}};
        for (Object[] c : cases) {
            String s = (String) c[0];
            Check.eq(new Solution().firstUniqChar(s), c[1], s.substring(0, Math.min(12, s.length())));
        }
        Check.done();
    }
}
