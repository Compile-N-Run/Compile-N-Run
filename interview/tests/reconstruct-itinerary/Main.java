import java.util.*;

class Main {
    static List<List<String>> tickets(String[][] pairs) {
        List<List<String>> out = new ArrayList<>();
        for (String[] p : pairs) out.add(new ArrayList<>(Arrays.asList(p)));
        return out;
    }

    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {new String[][] {{"JFK", "LHR"}, {"LHR", "CDG"}, {"CDG", "JFK"}, {"JFK", "AMS"}},
                new String[] {"JFK", "LHR", "CDG", "JFK", "AMS"}},
            new Object[] {new String[][] {{"JFK", "KUL"}, {"JFK", "NRT"}, {"NRT", "JFK"}}, new String[] {"JFK", "NRT", "JFK", "KUL"}},
            new Object[] {new String[][] {{"JFK", "NRT"}, {"NRT", "JFK"}, {"JFK", "NRT"}}, new String[] {"JFK", "NRT", "JFK", "NRT"}},
            new Object[] {new String[][] {{"JFK", "ZRH"}}, new String[] {"JFK", "ZRH"}},
            new Object[] {new String[][] {{"JFK", "SEA"}, {"SEA", "JFK"}}, new String[] {"JFK", "SEA", "JFK"}},
            new Object[] {new String[][] {{"JFK", "AAA"}, {"AAA", "BBB"}, {"BBB", "AAA"}, {"AAA", "CCC"}},
                new String[] {"JFK", "AAA", "BBB", "AAA", "CCC"}},
            new Object[] {new String[][] {{"SFO", "JFK"}, {"JFK", "SFO"}, {"JFK", "ATL"}, {"ATL", "SFO"}, {"SFO", "ATL"}},
                new String[] {"JFK", "ATL", "SFO", "JFK", "SFO", "ATL"}},
            new Object[] {new String[][] {{"JFK", "BBB"}, {"BBB", "CCC"}, {"CCC", "BBB"}, {"BBB", "AAA"}, {"AAA", "JFK"}, {"JFK", "DDD"}},
                new String[] {"JFK", "BBB", "CCC", "BBB", "AAA", "JFK", "DDD"}}));
        // A 300-ticket path given in scrambled order, and 150 out-and-back trips from JFK.
        String[] codes = new String[301];
        codes[0] = "JFK";
        for (int i = 0; i < 300; i++) codes[1 + i] = "" + (char) ('A' + i / 26) + (char) ('A' + i % 26) + "X";
        String[][] path = new String[300][], star = new String[300][];
        String[] starWant = new String[301];
        starWant[0] = "JFK";
        for (int k = 0; k < 300; k++) path[k] = new String[] {codes[(k * 7) % 300], codes[(k * 7) % 300 + 1]};
        for (int i = 0; i < 150; i++) {
            star[2 * i] = new String[] {codes[1 + i], "JFK"};
            star[2 * i + 1] = new String[] {"JFK", codes[1 + i]};
            starWant[2 * i + 1] = codes[1 + i];
            starWant[2 * i + 2] = "JFK";
        }
        cases.add(new Object[] {path, codes});
        cases.add(new Object[] {star, starWant});
        for (int n = 0; n < cases.size(); n++) {
            List<String> got = new Solution().findItinerary(tickets((String[][]) cases.get(n)[0]));
            Check.eq(got, Arrays.asList((String[]) cases.get(n)[1]), "case " + n);
        }
        Check.done();
    }
}
