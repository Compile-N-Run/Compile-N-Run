import java.util.*;

class Main {
    static List<List<String>> pairs(String... names) {
        List<List<String>> out = new ArrayList<>();
        for (int i = 0; i < names.length; i += 2) out.add(Arrays.asList(names[i], names[i + 1]));
        return out;
    }

    public static void main(String[] args) {
        List<List<String>> chain = new ArrayList<>();
        double[] twos = new double[19];
        for (int i = 0; i < 19; i++) { chain.add(Arrays.asList("v" + i, "v" + (i + 1))); twos[i] = 2.0; }
        Object[][] cases = {
            {pairs("a", "b", "b", "c"), new double[] {3.0, 0.5}, pairs("a", "c", "c", "a", "b", "b", "a", "z"), new double[] {1.5, 2.0 / 3, 1.0, -1.0}},
            {pairs("p", "q", "r", "s"), new double[] {4.0, 2.0}, pairs("p", "s", "q", "p", "s", "r"), new double[] {-1.0, 0.25, 0.5}},
            {pairs("x", "y"), new double[] {5.0}, pairs("x", "x", "w", "w", "y", "x"), new double[] {1.0, -1.0, 0.2}},
            {pairs("ab", "cd", "cd", "ef", "ab", "gh"), new double[] {2.0, 3.0, 4.0}, pairs("ef", "gh", "gh", "cd"), new double[] {4.0 / 6, 0.5}},
            {pairs("a", "b", "b", "c", "c", "a"), new double[] {2.0, 3.0, 1.0 / 6}, pairs("a", "c", "c", "b"), new double[] {6.0, 1.0 / 3}},
            {chain, twos, pairs("v0", "v19", "v19", "v0", "v5", "v10", "v3", "v20"), new double[] {524288.0, 1.0 / 524288, 32.0, -1.0}},
        };
        int n = 0;
        for (Object[] c : cases) {
            @SuppressWarnings("unchecked") List<List<String>> eqs = (List<List<String>>) c[0];
            @SuppressWarnings("unchecked") List<List<String>> qs = (List<List<String>>) c[2];
            double[] got = new Solution().calcEquation(eqs, (double[]) c[1], qs), expected = (double[]) c[3];
            boolean ok = got.length == expected.length;
            for (int i = 0; ok && i < got.length; i++) ok = Math.abs(got[i] - expected[i]) <= 1e-5 * Math.max(1.0, Math.abs(expected[i]));
            Check.eq(ok, true, "case " + (++n) + " got " + Arrays.toString(got));
        }
        Check.done();
    }
}
