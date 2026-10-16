import java.util.*;

class Main {
    static final int SAMPLES = 100000;

    // Draw many picks; every index must be valid and frequencies must match the weights.
    // Indexes are bucketed by i % buckets so long arrays can be checked with fewer samples.
    static void checkWeights(int[] w, int buckets) {
        int n = w.length;
        if (buckets == 0) buckets = n;
        Solution s = new Solution(w.clone());
        double total = 0;
        for (int x : w) total += x;
        double[] expected = new double[buckets];
        int[] counts = new int[buckets];
        for (int i = 0; i < n; i++) expected[i % buckets] += w[i] / total;
        for (int t = 0; t < SAMPLES; t++) {
            int i = s.pickIndex();
            if (i < 0 || i >= n) { Check.eq(i, "a valid index", "size " + n); return; }
            counts[i % buckets]++;
        }
        for (int g = 0; g < buckets; g++) {
            double got = (double) counts[g] / SAMPLES;
            // 6 standard deviations (+ a little slack): a false alarm is about one in a billion,
            // but an off-by-one that moves a whole slot between indexes is still caught.
            double p = expected[g], tolerance = 6 * Math.sqrt(p * (1 - p) / SAMPLES) + 0.0005;
            Check.eq(Math.abs(got - p) <= tolerance, true, "size " + n + " group " + g + ": expected " + expected[g] + ", got " + got);
        }
    }

    public static void main(String[] args) {
        checkWeights(new int[] {2, 5, 3}, 0);
        Solution s = new Solution(new int[] {7});
        for (int t = 0; t < 100; t++) Check.eq(s.pickIndex(), 0, "single weight");
        checkWeights(new int[] {1, 1, 1, 1}, 0);
        checkWeights(new int[] {1, 99}, 0);
        checkWeights(new int[] {100000, 1, 100000}, 0);
        checkWeights(new int[] {5, 1, 1, 1, 1, 1, 1, 1, 1, 5}, 0);
        // Larger case: 10000 weights up to 100000, checked in 10 buckets.
        int[] big = new int[10000];
        for (int i = 0; i < 10000; i++) big[i] = (int) ((long) i * 7919 % 100000) + 1;
        checkWeights(big, 10);
        Check.done();
    }
}
