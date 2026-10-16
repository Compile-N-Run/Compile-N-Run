import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] big1 = new int[5001];
        Arrays.fill(big1, 1);
        big1[5000] = -2;
        int[] big2 = new int[5001];
        Arrays.fill(big2, -1);
        big2[0] = 1000;
        int[][][] cases = {{{4, 9, -6}, {4, 9}}, {{7, -7}, {}}, {{-3, -1, 2, 5}, {-3, -1, 2, 5}}, {{3, 5, -8, 2}, {-8, 2}},
            {{10, 2, -5}, {10}}, {{1, -2, -3, 4}, {-2, -3, 4}}, {{5}, {5}}, {{-4}, {-4}}, {{6, 6, -6, -6}, {}},
            {big1, {-2}}, {big2, {1000}}};
        for (int n = 0; n < cases.length; n++) {
            Check.eq(new Solution().asteroidCollision(cases[n][0].clone()), cases[n][1], "case " + n);
        }
        Check.done();
    }
}
