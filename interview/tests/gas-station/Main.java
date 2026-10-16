import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] bigGas = new int[1000], bigCost = new int[1000];
        Arrays.fill(bigGas, 1);
        Arrays.fill(bigCost, 1);
        bigGas[700] = 2;
        bigCost[699] = 2;
        Object[][] cases = {{new int[] {2, 5, 1, 4}, new int[] {3, 2, 4, 1}, 1}, {new int[] {1, 1, 1}, new int[] {2, 1, 1}, -1},
            {new int[] {0, 0, 7}, new int[] {2, 3, 2}, 2}, {new int[] {3}, new int[] {3}, 0}, {new int[] {5}, new int[] {6}, -1},
            {new int[] {4, 0, 2}, new int[] {1, 3, 2}, 0}, {bigGas, bigCost, 700}};
        for (Object[] c : cases) {
            int got = new Solution().canCompleteCircuit(((int[]) c[0]).clone(), ((int[]) c[1]).clone());
            Check.eq(got, c[2], "n=" + ((int[]) c[0]).length);
        }
        Check.done();
    }
}
