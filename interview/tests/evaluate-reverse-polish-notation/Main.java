import java.util.*;

class Main {
    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {new String[] {"3", "4", "+", "2", "*"}, 14},
            new Object[] {new String[] {"10", "3", "/"}, 3},
            new Object[] {new String[] {"-7", "2", "/"}, -3},
            new Object[] {new String[] {"7", "-2", "/"}, -3},
            new Object[] {new String[] {"-7", "-2", "/"}, 3},
            new Object[] {new String[] {"0", "-5", "/"}, 0},
            new Object[] {new String[] {"2", "3", "4", "*", "+", "5", "-"}, 9},
            new Object[] {new String[] {"5"}, 5},
            new Object[] {new String[] {"-3", "-2", "*"}, 6},
            new Object[] {new String[] {"6", "3", "-"}, 3},
            new Object[] {new String[] {"2147483647", "1", "-"}, 2147483646},
            new Object[] {new String[] {"-2147483648", "1", "/"}, Integer.MIN_VALUE},
            new Object[] {new String[] {"4", "13", "5", "/", "+"}, 6}));
        List<String> ones = new ArrayList<>(); // pushes everything before the first operator
        for (int i = 0; i < 1000; i++) ones.add("1");
        for (int i = 0; i < 999; i++) ones.add("+");
        cases.add(new Object[] {ones.toArray(new String[0]), 1000});
        List<String> doubling = new ArrayList<>(Arrays.asList("3", "1", "*")); // x -> 2x - 1, ten times, from 3
        for (int i = 0; i < 10; i++) doubling.addAll(Arrays.asList("2", "*", "1", "-"));
        cases.add(new Object[] {doubling.toArray(new String[0]), 2049});
        for (int n = 0; n < cases.size(); n++) {
            String[] tokens = (String[]) cases.get(n)[0];
            String label = tokens.length <= 12 ? String.join(" ", tokens) : tokens.length + " tokens";
            Check.eq(new Solution().evalRPN(tokens.clone()), cases.get(n)[1], "case " + n + " " + label);
        }
        Check.done();
    }
}
