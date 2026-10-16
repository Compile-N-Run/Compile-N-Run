import java.util.*;

class Main {
    public static void main(String[] args) {
        // Each op is {0, account, 0, money, expected} for deposit, {1, account, 0, money, expected} for withdraw
        // or {2, account1, account2, money, expected} for transfer.
        List<Object[]> cases = new ArrayList<>(Arrays.asList(
            new Object[] {new long[] {10, 100, 20, 50, 30}, new long[][] {{1, 3, 0, 10, 1}, {2, 5, 1, 20, 1}, {0, 5, 0, 20, 1}, {2, 3, 4, 15, 0},
                {1, 10, 0, 50, 0}, {1, 1, 0, 30, 1}, {1, 5, 0, 30, 1}, {1, 2, 0, 101, 0}}},
            new Object[] {new long[] {0}, new long[][] {{0, 1, 0, 5, 1}, {1, 1, 0, 5, 1}, {1, 1, 0, 1, 0}, {2, 1, 2, 1, 0}, {0, 0, 0, 5, 0},
                {0, 2, 0, 5, 0}, {1, 1, 0, 1, 0}}},
            new Object[] {new long[] {7}, new long[][] {{1, 1, 0, 8, 0}, {1, 1, 0, 7, 1}, {1, 1, 0, 7, 0}}},
            new Object[] {new long[] {5, 0}, new long[][] {{2, 2, 1, 1, 0}, {2, 1, 2, 5, 1}, {2, 1, 2, 1, 0}, {1, 2, 0, 5, 1}, {1, 1, 0, 1, 0}}},
            new Object[] {new long[] {5000000000000L, 1}, new long[][] {{1, 1, 0, 4000000000000L, 1}, {2, 1, 2, 1000000000000L, 1}, {1, 1, 0, 1, 0},
                {1, 2, 0, 1000000000001L, 1}, {1, 2, 0, 1, 0}, {0, 2, 0, 9999999999999L, 1}, {1, 2, 0, 9999999999999L, 1}}},
            new Object[] {new long[] {10, 10}, new long[][] {{2, 1, 2, 11, 0}, {2, 1, 3, 5, 0}, {2, 0, 2, 5, 0}, {1, 1, 0, 10, 1}, {1, 2, 0, 10, 1},
                {2, 1, 2, 1, 0}}}));
        List<long[]> big = new ArrayList<>();
        for (long i = 1; i <= 1000; i++) big.add(new long[] {0, i, 0, i, 1});
        for (long i = 1; i < 1000; i++) big.add(new long[] {2, i, i + 1, 1000 + i, 1});
        for (long i = 2; i < 1000; i++) big.add(new long[] {1, i, 0, 999 + i, 1});
        for (long i = 1; i < 1000; i++) big.add(new long[] {1, i, 0, 1, 0});
        big.add(new long[] {1, 1000, 0, 3999, 1});
        big.add(new long[] {1, 1000, 0, 1, 0});
        long[] balance = new long[1000];
        Arrays.fill(balance, 1000);
        cases.add(new Object[] {balance, big.toArray(new long[0][])});
        for (int n = 0; n < cases.size(); n++) {
            Bank bank = new Bank(((long[]) cases.get(n)[0]).clone());
            long[][] ops = (long[][]) cases.get(n)[1];
            for (int step = 0; step < ops.length; step++) {
                long[] op = ops[step];
                int a = (int) op[1], b = (int) op[2];
                boolean got = op[0] == 0 ? bank.deposit(a, op[3]) : op[0] == 1 ? bank.withdraw(a, op[3]) : bank.transfer(a, b, op[3]);
                Check.eq(got, op[4] == 1, "case " + n + " step " + step + " op " + op[0] + "(" + a + ", " + b + ", " + op[3] + ")");
            }
        }
        Check.done();
    }
}
