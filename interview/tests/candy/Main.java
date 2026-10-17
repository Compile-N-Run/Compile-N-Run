import java.util.*;

class Main {
    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {new int[] {1, 3, 2}, 4},
            new Object[] {new int[] {2, 2, 2}, 3},
            new Object[] {new int[] {5, 4, 3, 2}, 10},
            new Object[] {new int[] {1, 2, 2, 1}, 6},
            new Object[] {new int[] {7}, 1},
            new Object[] {new int[] {1, 0, 2}, 5},
            new Object[] {new int[] {1, 2, 3, 1}, 7},
            new Object[] {new int[] {1, 2, 87, 87, 87, 2, 1}, 13},
            new Object[] {new int[] {1, 2, 3, 4, 3, 2, 1}, 16}));
        int[] alternating = new int[1000], rising = new int[1000], slope = new int[999];
        for (int i = 0; i < 1000; i++) { alternating[i] = i % 2; rising[i] = i; } // 1,2,1,2,... and 1+2+...+1000
        for (int i = 0; i < 999; i++) slope[i] = i < 500 ? 500 - i : i - 499; // a long slope down then up
        cases.add(new Object[] {alternating, 1500});
        cases.add(new Object[] {rising, 500500});
        cases.add(new Object[] {slope, 250000});
        for (Object[] c : cases) {
            int[] ratings = (int[]) c[0];
            int got = new Solution().candy(ratings.clone());
            String head = Arrays.toString(Arrays.copyOf(ratings, Math.min(8, ratings.length)));
            Check.eq(got, c[1], "ratings=" + head + (ratings.length > 8 ? "... (" + ratings.length + " children)" : ""));
        }
        Check.done();
    }
}
