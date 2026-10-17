import java.util.*;

class Main {
    public static void main(String[] args) {
        int[] oneTo50000 = new int[50000], evens50000 = new int[50000];
        for (int i = 1; i <= 50000; i++) {
            oneTo50000[i - 1] = i;
            evens50000[i - 1] = 2 * i;
        }
        Object[][] cases = {
            {new int[] {1, 10, 100}, new int[] {1000}, 3},
            {new int[] {123, 456}, new int[] {1234, 45}, 3},
            {new int[] {12}, new int[] {123, 124, 125}, 2},
            {new int[] {1, 2, 3}, new int[] {4, 4, 4}, 0},
            {new int[] {100000000}, new int[] {100000000}, 9},
            {new int[] {5}, new int[] {5}, 1},
            {new int[] {7, 77, 777}, new int[] {7777}, 3},
            {new int[] {100}, new int[] {1000, 10}, 3},
            {new int[] {13, 27}, new int[] {2, 1}, 1},
            {new int[] {987654321}, new int[] {98765, 9876543}, 7},
            {new int[] {21, 210}, new int[] {2100, 20}, 3},
            {oneTo50000, new int[] {49999}, 5}, // 49999 itself is in arr1
            {oneTo50000, new int[] {100000000}, 5}, // prefix 10000 is in arr1 but 100000 is not
            {evens50000, new int[] {99999999}, 4}, // 9999 is a prefix of 99990, but no even number below 100001 starts with 99999
        };
        for (int n = 0; n < cases.length; n++) {
            int[] arr1 = (int[]) cases[n][0], arr2 = (int[]) cases[n][1];
            Check.eq(new Solution().longestCommonPrefix(arr1, arr2), cases[n][2],
                "case " + n + " (arr1 length " + arr1.length + ", arr2 " + Arrays.toString(arr2) + ")");
        }
        Check.done();
    }
}
