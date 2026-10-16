import java.util.*;

class Main {
    public static void main(String[] args) {
        // Each op is {0, value, expected} for enQueue, {1, 0, expected} for deQueue, {2, 0, expected} for Front,
        // {3, 0, expected} for Rear, {4, 0, expected} for isEmpty or {5, 0, expected} for isFull; booleans are 1/0.
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {3, new int[][] {{0, 4, 1}, {0, 9, 1}, {0, 2, 1}, {0, 7, 0}, {5, 0, 1}, {1, 0, 1}, {2, 0, 9}, {0, 7, 1}, {3, 0, 7}, {4, 0, 0}}},
            new Object[] {1, new int[][] {{2, 0, -1}, {3, 0, -1}, {1, 0, 0}, {4, 0, 1}, {0, 5, 1}, {5, 0, 1}, {0, 6, 0}, {2, 0, 5}, {3, 0, 5},
                {1, 0, 1}, {4, 0, 1}, {2, 0, -1}, {0, 8, 1}, {3, 0, 8}}},
            new Object[] {2, new int[][] {{0, 1, 1}, {0, 2, 1}, {1, 0, 1}, {0, 3, 1}, {2, 0, 2}, {3, 0, 3}, {5, 0, 1}, {1, 0, 1}, {1, 0, 1},
                {1, 0, 0}, {4, 0, 1}, {0, 7, 1}, {2, 0, 7}, {3, 0, 7}}},
            new Object[] {4, new int[][] {{0, 1, 1}, {0, 2, 1}, {0, 3, 1}, {0, 4, 1}, {5, 0, 1}, {1, 0, 1}, {1, 0, 1}, {1, 0, 1}, {1, 0, 1},
                {4, 0, 1}, {0, 5, 1}, {0, 6, 1}, {2, 0, 5}, {3, 0, 6}, {1, 0, 1}, {2, 0, 6}, {3, 0, 6}}},
            new Object[] {3, new int[][] {{0, 0, 1}, {0, 0, 1}, {2, 0, 0}, {3, 0, 0}, {1, 0, 1}, {3, 0, 0}, {2, 0, 0}, {0, 1000, 1}, {3, 0, 1000}, {5, 0, 0}, {0, 2, 1}, {5, 0, 1}}},
            new Object[] {3, new int[][] {{0, 1, 1}, {0, 2, 1}, {0, 3, 1}, {1, 0, 1}, {0, 4, 1}, {2, 0, 2}, {3, 0, 4}, {1, 0, 1}, {0, 5, 1},
                {2, 0, 3}, {3, 0, 5}, {1, 0, 1}, {0, 6, 1}, {2, 0, 4}, {3, 0, 6}, {1, 0, 1}, {0, 7, 1}, {2, 0, 5}, {3, 0, 7}}}));
        List<int[]> big = new ArrayList<>();
        for (int v = 0; v < 1000; v++) big.add(new int[] {0, v, 1});
        big.add(new int[] {0, 1000, 0});
        big.add(new int[] {5, 0, 1});
        for (int i = 0; i < 500; i++) big.add(new int[] {1, 0, 1});
        big.add(new int[] {2, 0, 500});
        big.add(new int[] {3, 0, 999});
        for (int v = 1000; v < 1500; v++) big.add(new int[] {0, v, 1});
        big.add(new int[] {3, 0, 1499});
        big.add(new int[] {5, 0, 1});
        big.add(new int[] {0, 9, 0});
        for (int i = 0; i < 1000; i++) big.add(new int[] {1, 0, 1});
        big.add(new int[] {1, 0, 0});
        big.add(new int[] {4, 0, 1});
        big.add(new int[] {2, 0, -1});
        big.add(new int[] {3, 0, -1});
        cases.add(new Object[] {1000, big.toArray(new int[0][])});
        for (int n = 0; n < cases.size(); n++) {
            MyCircularQueue queue = new MyCircularQueue((int) cases.get(n)[0]);
            int[][] ops = (int[][]) cases.get(n)[1];
            for (int step = 0; step < ops.length; step++) {
                int op = ops[step][0], value = ops[step][1], expected = ops[step][2];
                String label = "case " + n + " step " + step + " op " + op;
                if (op == 0) Check.eq(queue.enQueue(value), expected == 1, label);
                else if (op == 1) Check.eq(queue.deQueue(), expected == 1, label);
                else if (op == 2) Check.eq(queue.Front(), expected, label);
                else if (op == 3) Check.eq(queue.Rear(), expected, label);
                else if (op == 4) Check.eq(queue.isEmpty(), expected == 1, label);
                else Check.eq(queue.isFull(), expected == 1, label);
            }
        }
        Check.done();
    }
}
