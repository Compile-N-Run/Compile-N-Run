class Main {
    // Any topological order is accepted; an impossible schedule must give an empty array.
    static boolean valid(int n, int[][] prereq, int[] order, boolean possible) {
        if (!possible) return order.length == 0;
        if (order.length != n) return false;
        int[] pos = new int[n];
        java.util.Arrays.fill(pos, -1);
        for (int i = 0; i < n; i++) {
            if (order[i] < 0 || order[i] >= n || pos[order[i]] != -1) return false;
            pos[order[i]] = i;
        }
        for (int[] p : prereq) {
            if (pos[p[1]] > pos[p[0]]) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        int[][] chain = new int[1999][], looped = new int[2000][]; // course i before course i - 1
        for (int i = 1; i < 2000; i++) chain[i - 1] = looped[i - 1] = new int[] {i - 1, i};
        looped[1999] = new int[] {1999, 0};
        Object[][] cases = {{3, new int[][] {{1, 0}, {2, 1}}, true}, {4, new int[][] {{1, 0}, {2, 0}, {3, 1}, {3, 2}}, true},
            {3, new int[][] {{0, 2}, {2, 0}}, false}, {3, new int[][] {}, true}, {1, new int[][] {}, true},
            {3, new int[][] {{0, 1}, {1, 2}, {2, 0}}, false}, {6, new int[][] {{5, 4}, {4, 3}, {0, 5}, {2, 1}}, true},
            {2000, chain, true}, {2000, looped, false}};
        for (int i = 0; i < cases.length; i++) {
            Object[] c = cases[i];
            int n = (int) c[0];
            int[][] prereq = (int[][]) c[1];
            int[][] copy = new int[prereq.length][];
            for (int k = 0; k < prereq.length; k++) copy[k] = prereq[k].clone();
            int[] got = new Solution().findOrder(n, copy);
            Check.eq(valid(n, prereq, got, (boolean) c[2]), true, "case " + i);
        }
        Check.done();
    }
}
