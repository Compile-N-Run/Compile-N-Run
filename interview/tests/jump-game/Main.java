import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] bigOk = new int[10000], bigStuck = new int[10000], bigLeap = new int[10000];
        Arrays.fill(bigOk, 1);
        Arrays.fill(bigStuck, 1);
        bigStuck[5000] = 0;
        bigLeap[0] = 10000;
        int[][] inputs = {{2, 0, 1, 0}, {1, 1, 0, 2}, {3, 0, 0, 0, 5}, {0}, {5}, {0, 1}, {2, 3, 0, 0, 1}, {4, 0, 0, 0, 0},
            {1, 0, 1, 0}, bigOk, bigStuck, bigLeap};
        boolean[] expected = {true, false, false, true, true, false, true, true, false, true, false, true};
        for (int n = 0; n < inputs.length; n++) {
            Check.eq(new Solution().canJump(inputs[n].clone()), expected[n], "case " + n);
        }
        Check.done();
    }
}
