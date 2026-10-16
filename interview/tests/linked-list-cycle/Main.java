import java.util.*;

class Main {
    // Build the list and point the tail at node `pos` (-1 for no cycle).
    static ListNode buildCycle(int[] values, int pos) {
        ListNode head = Check.list(values);
        if (pos >= 0) {
            ListNode tail = head, target = head;
            while (tail.next != null) tail = tail.next;
            for (int i = 0; i < pos; i++) target = target.next;
            tail.next = target;
        }
        return head;
    }

    public static void main(String[] args) {
        int[] big = new int[10000];
        for (int i = 0; i < big.length; i++) big[i] = i;
        Object[][] cases = {{new int[] {5, 8, 2, 9}, 1, true}, {new int[] {1, 2}, 0, true}, {new int[] {4, 4, 4}, -1, false},
            {new int[] {7}, 0, true}, {new int[] {}, -1, false}, {new int[] {7}, -1, false}, {new int[] {1, 2, 3, 4, 5}, 4, true},
            {new int[] {1, 2, 3, 4, 5, 6}, -1, false}, {new int[] {3, 3, 3, 3}, 3, true},
            {big, -1, false}, {big, 5000, true}, {big, 0, true}, {big, 9999, true}};
        for (int n = 0; n < cases.length; n++) {
            int pos = (int) cases[n][1];
            Check.eq(new Solution().hasCycle(buildCycle((int[]) cases[n][0], pos)), cases[n][2], "case " + n + " pos=" + pos);
        }
        Check.done();
    }
}
