import java.util.*;

class Main {
    public static void main(String[] args) {
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {new int[] {1, 2, 4}, new int[] {3, 5, 6}, new int[] {50, 10, 70}, 120},
            new Object[] {new int[] {1, 1, 1}, new int[] {2, 3, 4}, new int[] {5, 6, 4}, 6},
            new Object[] {new int[] {1, 3, 5}, new int[] {3, 5, 7}, new int[] {10, 10, 10}, 30},
            new Object[] {new int[] {2, 5, 1, 6}, new int[] {4, 7, 8, 9}, new int[] {30, 25, 100, 20}, 100},
            new Object[] {new int[] {4}, new int[] {9}, new int[] {7}, 7},
            new Object[] {new int[] {1, 2}, new int[] {10, 3}, new int[] {5, 5}, 5},
            new Object[] {new int[] {1, 2, 3}, new int[] {4, 5, 6}, new int[] {3, 3, 3}, 3},
            new Object[] {new int[] {1, 4, 2}, new int[] {4, 6, 6}, new int[] {5, 6, 10}, 11},
            new Object[] {new int[] {1, 999999999}, new int[] {1000000000, 1000000000}, new int[] {1, 2}, 2}));
        // 10000 unit jobs in reverse order: all of them fit.
        int[] unitStart = new int[10000], unitEnd = new int[10000], unitProfit = new int[10000];
        for (int i = 0; i < 10000; i++) {
            unitStart[i] = 9999 - i;
            unitEnd[i] = 10000 - i;
            unitProfit[i] = 1;
        }
        cases.add(new Object[] {unitStart, unitEnd, unitProfit, 10000});
        // Unit jobs plus length-2 jobs worth 3: one unit job (0..1) then 5000 long jobs at 1, 3, ..., 9999.
        int[] mixStart = new int[20000], mixEnd = new int[20000], mixProfit = new int[20000];
        for (int i = 0; i < 10000; i++) {
            mixStart[i] = unitStart[i];
            mixEnd[i] = unitEnd[i];
            mixProfit[i] = 1;
            mixStart[10000 + i] = i;
            mixEnd[10000 + i] = i + 2;
            mixProfit[10000 + i] = 3;
        }
        cases.add(new Object[] {mixStart, mixEnd, mixProfit, 15001});
        for (int n = 0; n < cases.size(); n++) {
            Object[] c = cases.get(n);
            int got = new Solution().jobScheduling(((int[]) c[0]).clone(), ((int[]) c[1]).clone(), ((int[]) c[2]).clone());
            Check.eq(got, c[3], "case " + n + " (n=" + ((int[]) c[0]).length + ")");
        }
        Check.done();
    }
}
