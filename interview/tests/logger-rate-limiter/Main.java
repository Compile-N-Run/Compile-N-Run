import java.util.*;

class Main {
    public static void main(String[] args) {
        // Each case is a list of {timestamp, message, expected} calls on one Logger.
        List<Object[][]> cases = new ArrayList<>(Arrays.asList(
            new Object[][] {{1, "start", true}, {4, "stop", true}, {10, "start", false}, {11, "start", true}, {13, "stop", false}, {14, "stop", true}},
            new Object[][] {{0, "a", true}, {5, "a", false}, {9, "a", false}, {10, "a", true}, {19, "a", false}, {20, "a", true}},
            new Object[][] {{7, "x", true}, {7, "y", true}, {7, "x", false}, {7, "z", true}, {16, "y", false}, {17, "y", true}},
            new Object[][] {{1000000000, "only", true}},
            new Object[][] {{1, "foo", true}, {100, "foo", true}, {105, "bar", true}, {109, "foo", false}, {110, "foo", true}},
            new Object[][] {{3, "Hi", true}, {4, "hi", true}, {5, "Hi", false}, {13, "Hi", true}, {13, "hi", false}, {14, "hi", true}}));
        Object[][] big = new Object[20000][];
        for (int t = 0; t < 10000; t++) {
            big[2 * t] = new Object[] {t, "m" + (t % 50), true}; // each of these repeats every 50 seconds
            big[2 * t + 1] = new Object[] {t, "same", t % 10 == 0};
        }
        cases.add(big);
        for (int n = 0; n < cases.size(); n++) {
            Logger logger = new Logger();
            Object[][] calls = cases.get(n);
            for (int step = 0; step < calls.length; step++) {
                Object[] c = calls[step];
                // new String(...) makes sure the solution compares message text, not object identity.
                boolean got = logger.shouldPrintMessage((int) c[0], new String((String) c[1]));
                Check.eq(got, c[2], "case " + n + " step " + step + " (" + c[0] + ", " + c[1] + ")");
            }
        }
        Check.done();
    }
}
