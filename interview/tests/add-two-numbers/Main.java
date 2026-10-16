import java.util.*;

class Main {
    static List<Integer> boxed(int[] values) {
        List<Integer> out = new ArrayList<>();
        for (int v : values) out.add(v);
        return out;
    }

    public static void main(String[] args) {
        int[] nines = new int[100], bigSum = new int[101];
        Arrays.fill(nines, 9);
        bigSum[100] = 1;
        int[] seq = new int[100]; // 1234567890 repeated 10 times, ones digit first
        int[] pattern = {0, 9, 8, 7, 6, 5, 4, 3, 2, 1};
        for (int i = 0; i < 100; i++) seq[i] = pattern[i % 10];
        List<Integer> seqDouble = new ArrayList<>();
        int carryIn = 0;
        for (int d : seq) { int s = 2 * d + carryIn; seqDouble.add(s % 10); carryIn = s / 10; }
        if (carryIn > 0) seqDouble.add(carryIn);
        Object[][] cases = {{new int[] {2, 1, 5}, new int[] {8, 4}, List.of(0, 6, 5)}, {new int[] {9, 9}, new int[] {1}, List.of(0, 0, 1)},
            {new int[] {0}, new int[] {0}, List.of(0)}, {new int[] {3}, new int[] {4}, List.of(7)},
            {new int[] {1}, new int[] {9, 9, 9, 9}, List.of(0, 0, 0, 0, 1)}, {new int[] {5}, new int[] {5}, List.of(0, 1)},
            {new int[] {1, 0, 1}, new int[] {2, 3}, List.of(3, 3, 1)}, {nines, new int[] {1}, boxed(bigSum)}, {seq, seq, seqDouble}};
        for (Object[] c : cases) {
            int[] a = (int[]) c[0], b = (int[]) c[1];
            Check.eq(Check.values(new Solution().addTwoNumbers(Check.list(a), Check.list(b))), c[2],
                Arrays.toString(a) + " + " + Arrays.toString(b));
        }
        Check.done();
    }
}
