import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {{7, true}, {4, false}, {1, true}, {100, true}, {2, false}, {Integer.MAX_VALUE, false}, {1111111, true}, {999999999, false}};
        for (Object[] c : cases) Check.eq(new Solution().isHappy((int) c[0]), c[1], "n=" + c[0]);
        // Every number up to 100, compared with the known list of happy numbers.
        Set<Integer> happy = new HashSet<>(Arrays.asList(1, 7, 10, 13, 19, 23, 28, 31, 32, 44, 49, 68, 70, 79, 82, 86, 91, 94, 97, 100));
        for (int n = 1; n <= 100; n++) Check.eq(new Solution().isHappy(n), happy.contains(n), "n=" + n);
        Check.done();
    }
}
