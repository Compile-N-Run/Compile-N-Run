import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] big = new int[1000], bigExpected = new int[1000];
        for (int i = 0; i < 999; i++) { big[i] = 50; bigExpected[i] = 999 - i; }
        big[999] = 60;
        Object[][] cases = {{new int[] {70, 68, 69, 72, 71}, new int[] {3, 1, 1, 0, 0}}, {new int[] {50, 50, 50}, new int[] {0, 0, 0}},
            {new int[] {30, 40, 50}, new int[] {1, 1, 0}}, {new int[] {80, 60, 70, 90}, new int[] {3, 1, 1, 0}},
            {new int[] {55}, new int[] {0}}, {new int[] {100, 90, 80, 95, 30}, new int[] {0, 2, 1, 0, 0}}, {big, bigExpected}};
        for (Object[] c : cases) {
            Check.eq(new Solution().dailyTemperatures(((int[]) c[0]).clone()), c[1], "n=" + ((int[]) c[0]).length);
        }
        Check.done();
    }
}
