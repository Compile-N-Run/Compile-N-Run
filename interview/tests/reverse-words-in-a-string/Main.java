import java.util.*;

class Main {
    public static void main(String[] args) {
        List<String[]> cases = new ArrayList<>(Arrays.asList(new String[][] {{"  hello   big world ", "world big hello"}, {"a", "a"},
            {"code  2 run", "run 2 code"}, {"   spaces  ", "spaces"}, {"x y z", "z y x"}, {"Ab12 cD", "cD Ab12"}, {"same same", "same same"}}));
        // Larger case: 2000 words with 1 to 3 spaces between them and spaces at both ends.
        StringBuilder big = new StringBuilder("  "), expected = new StringBuilder();
        for (int i = 0; i < 2000; i++) big.append("w").append(i).append(" ".repeat(1 + i % 3));
        for (int i = 1999; i >= 0; i--) expected.append("w").append(i).append(i > 0 ? " " : "");
        cases.add(new String[] {big.toString(), expected.toString()});
        for (String[] c : cases) Check.eq(new Solution().reverseWords(c[0]), c[1], "\"" + c[0].substring(0, Math.min(30, c[0].length())) + "\"");
        Check.done();
    }
}
