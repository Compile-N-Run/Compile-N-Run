import java.util.*;

class Main {
    // Each op is {"set", key, value, timestamp} or {"get", key, timestamp, expected}.
    static String[] s(String k, String v, int t) { return new String[] {"set", k, v, String.valueOf(t)}; }
    static String[] g(String k, int t, String want) { return new String[] {"get", k, String.valueOf(t), want}; }

    public static void main(String[] args) {
        List<String[][]> cases = new ArrayList<>(Arrays.asList(
            new String[][] {s("color", "red", 3), s("color", "blue", 8), g("color", 2, ""), g("color", 3, "red"),
                g("color", 5, "red"), g("color", 8, "blue"), g("color", 100, "blue"), g("size", 5, "")},
            new String[][] {g("x", 1, "")},
            new String[][] {s("a", "one", 1), g("a", 1, "one"), g("a", 10000000, "one")},
            new String[][] {s("a", "p", 2), s("b", "q", 4), s("a", "r", 6), g("b", 3, ""), g("a", 4, "p"), g("b", 5, "q"),
                g("a", 6, "r"), g("c", 6, "")},
            new String[][] {s("k", "same", 1), s("k", "same", 2), s("k", "diff", 3), g("k", 2, "same"), g("k", 3, "diff")},
            new String[][] {s("love", "high", 10), s("love", "low", 20), g("love", 5, ""), g("love", 10, "high"),
                g("love", 15, "high"), g("love", 20, "low"), g("love", 25, "low")}));
        String[][] big = new String[2001][];
        for (int i = 1; i <= 1000; i++) {
            big[i - 1] = s("k", "v" + i, 2 * i);
            big[999 + i] = g("k", 2 * i + 1, "v" + i);
        }
        big[2000] = g("k", 1, "");
        cases.add(big);
        for (int n = 0; n < cases.size(); n++) {
            TimeMap tm = new TimeMap();
            String[][] ops = cases.get(n);
            for (int step = 0; step < ops.length; step++) {
                String[] op = ops[step];
                if (op[0].equals("set")) tm.set(op[1], op[2], Integer.parseInt(op[3]));
                else Check.eq(tm.get(op[1], Integer.parseInt(op[2])), op[3], "case " + n + " step " + step + " get(" + op[1] + ", " + op[2] + ")");
            }
        }
        Check.done();
    }
}
