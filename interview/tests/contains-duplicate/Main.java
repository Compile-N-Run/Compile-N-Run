import java.util.*;

class Main {
    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {new int[] {4, 1, 7, 1}, true},
            new Object[] {new int[] {3, 8, -2, 5}, false},
            new Object[] {new int[] {0, 0}, true},
            new Object[] {new int[] {42}, false},
            new Object[] {new int[] {-1, 1, -1}, true},
            new Object[] {new int[] {2147483647, -2147483648, 0}, false},
            new Object[] {new int[] {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 5}, true}));
        int[] distinct = new int[100000], withDup = new int[100001];
        for (int i = 0; i < 100000; i++) { distinct[i] = i; withDup[i] = i; }
        withDup[100000] = 99999;
        cases.add(new Object[] {distinct, false});
        cases.add(new Object[] {withDup, true});
        for (int n = 0; n < cases.size(); n++) {
            int[] nums = ((int[]) cases.get(n)[0]).clone();
            Check.eq(new Solution().containsDuplicate(nums), cases.get(n)[1], "case " + n);
        }
        Check.done();
    }
}
