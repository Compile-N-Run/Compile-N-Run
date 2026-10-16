import java.util.*;

class Main {
    public static void main(String[] args) {
        // Each op is {0, value} for push, {1, 0} for pop, {2, expected} for top or {3, expected} for getMin.
        List<int[]> big = new ArrayList<>();
        for (int v = 1000; v >= 1; v--) big.add(new int[] {0, v});
        for (int v = 1; v < 1000; v++) {
            big.add(new int[] {3, v});
            big.add(new int[] {2, v});
            big.add(new int[] {1, 0});
        }
        big.add(new int[] {3, 1000});
        for (int v = 2000; v < 3000; v++) big.add(new int[] {0, v});
        big.add(new int[] {3, 1000});
        big.add(new int[] {2, 2999});
        int[][][] cases = {
            {{0, 4}, {0, 2}, {0, 7}, {3, 2}, {2, 7}, {1, 0}, {1, 0}, {3, 4}, {2, 4}},
            {{0, 3}, {0, 3}, {1, 0}, {3, 3}, {2, 3}},
            {{0, -1}, {0, 5}, {3, -1}, {2, 5}},
            {{0, 9}, {3, 9}, {2, 9}},
            {{0, Integer.MIN_VALUE}, {0, Integer.MAX_VALUE}, {3, Integer.MIN_VALUE}, {2, Integer.MAX_VALUE}, {1, 0}, {2, Integer.MIN_VALUE}},
            {{0, 1}, {0, 2}, {0, 0}, {3, 0}, {1, 0}, {3, 1}, {0, -3}, {3, -3}, {1, 0}, {1, 0}, {3, 1}, {2, 1}},
            {{0, 5}, {1, 0}, {0, 8}, {3, 8}, {0, 6}, {3, 6}, {2, 6}},
            big.toArray(new int[0][]),
        };
        for (int n = 0; n < cases.length; n++) {
            MinStack stack = new MinStack();
            for (int step = 0; step < cases[n].length; step++) {
                int[] op = cases[n][step];
                String label = "case " + n + " step " + step;
                if (op[0] == 0) stack.push(op[1]);
                else if (op[0] == 1) stack.pop();
                else if (op[0] == 2) Check.eq(stack.top(), op[1], label + " top");
                else Check.eq(stack.getMin(), op[1], label + " getMin");
            }
        }
        Check.done();
    }
}
