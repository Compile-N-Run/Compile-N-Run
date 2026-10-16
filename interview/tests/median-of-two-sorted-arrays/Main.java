import java.util.*;

class Main {
    static double reference(int[] a, int[] b) {
        int[] m = new int[a.length + b.length];
        System.arraycopy(a, 0, m, 0, a.length);
        System.arraycopy(b, 0, m, a.length, b.length);
        Arrays.sort(m);
        int t = m.length;
        return t % 2 == 1 ? m[t / 2] : (m[t / 2 - 1] + (double) m[t / 2]) / 2;
    }

    public static void main(String[] args) {
        int[] big1 = new int[999], big2 = new int[1000];
        for (int i = 0; i < 999; i++) big1[i] = (i * 7919) % 2001 - 1000;
        for (int i = 0; i < 1000; i++) big2[i] = (int) ((i * 104729L) % 1999) - 1000;
        Arrays.sort(big1);
        Arrays.sort(big2);
        Object[][] cases = {{new int[] {1, 4, 9}, new int[] {2, 3}, 3.0}, {new int[] {5, 8}, new int[] {1, 2, 10, 12}, 6.5},
            {new int[] {}, new int[] {7}, 7.0}, {new int[] {2, 2}, new int[] {2, 2}, 2.0}, {new int[] {3}, new int[] {}, 3.0},
            {new int[] {1, 2}, new int[] {3, 4}, 2.5}, {new int[] {10, 20, 30}, new int[] {1, 2, 3, 4, 5, 6}, 5.0},
            {new int[] {-5, -3}, new int[] {-4}, -4.0}, {new int[] {1000000}, new int[] {-1000000}, 0.0},
            {big1, big2, reference(big1, big2)}};
        for (int k = 0; k < cases.length; k++) {
            Object[] c = cases[k];
            double got = new Solution().findMedianSortedArrays(((int[]) c[0]).clone(), ((int[]) c[1]).clone());
            Check.eq(Math.abs(got - (double) c[2]) <= 1e-6, true, "case " + k + " got " + got + " expected " + c[2]);
        }
        Check.done();
    }
}
