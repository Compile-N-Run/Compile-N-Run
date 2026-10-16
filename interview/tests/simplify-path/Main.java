import java.util.*;

class Main {
    public static void main(String[] args) {
        StringBuilder big = new StringBuilder(), bigExpected = new StringBuilder();
        for (int i = 0; i < 500; i++) {
            big.append("/d").append(i).append("/./e").append(i).append("//..");
            if (i < 499) bigExpected.append("/d").append(i);
        }
        big.append("/../");
        String[][] cases = {{"/docs/./drafts//final/", "/docs/drafts/final"}, {"/a/b/../../c", "/c"}, {"/../..", "/"},
            {"/x/.../y/..", "/x/..."}, {"/", "/"}, {"///", "/"}, {"/home/", "/home"}, {"/a/./b/./c/.", "/a/b/c"},
            {"/.hidden/..../_x/", "/.hidden/..../_x"}, {"/a/..", "/"}, {big.toString(), bigExpected.toString()}};
        for (String[] c : cases) {
            Check.eq(new Solution().simplifyPath(c[0]), c[1], c[0].substring(0, Math.min(40, c[0].length())));
        }
        Check.done();
    }
}
