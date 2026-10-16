import java.util.*;

class Main {
    // Each sequence is a list of operations: {0, num} adds num, {1, expected} checks the median.
    public static void main(String[] args) {
        List<double[][]> sequences = new ArrayList<>(List.of(
            new double[][] {{0, 4}, {1, 4.0}, {0, 10}, {1, 7.0}, {0, 1}, {1, 4.0}, {0, 7}, {1, 5.5}},
            new double[][] {{0, -5}, {1, -5.0}},
            new double[][] {{0, 3}, {0, 3}, {0, 3}, {1, 3.0}, {0, 3}, {1, 3.0}},
            new double[][] {{0, 5}, {1, 5.0}, {0, 4}, {1, 4.5}, {0, 3}, {1, 4.0}, {0, 2}, {1, 3.5}, {0, 1}, {1, 3.0}},
            new double[][] {{0, -100000}, {0, 100000}, {1, 0.0}, {0, 0}, {1, 0.0}},
            new double[][] {{0, 2}, {1, 2.0}, {1, 2.0}, {0, 8}, {1, 5.0}, {1, 5.0}}));
        double[][] big = new double[6000][];
        List<Integer> ref = new ArrayList<>();
        long x = 11;
        for (int i = 0; i < 3000; i++) {
            x = x * 48271 % 2147483647L;
            int num = (int) (x % 200001) - 100000;
            int pos = Collections.binarySearch(ref, num);
            ref.add(pos >= 0 ? pos : -pos - 1, num);
            int t = ref.size();
            big[2 * i] = new double[] {0, num};
            big[2 * i + 1] = new double[] {1, t % 2 == 1 ? ref.get(t / 2) : (ref.get(t / 2 - 1) + (double) ref.get(t / 2)) / 2};
        }
        sequences.add(big);
        for (int s = 0; s < sequences.size(); s++) {
            MedianFinder finder = new MedianFinder();
            double[][] ops = sequences.get(s);
            for (int step = 0; step < ops.length; step++) {
                if (ops[step][0] == 0) {
                    finder.addNum((int) ops[step][1]);
                } else {
                    double got = finder.findMedian();
                    Check.eq(Math.abs(got - ops[step][1]) <= 1e-6, true, "sequence " + s + " step " + step + " got " + got);
                }
            }
        }
        Check.done();
    }
}
