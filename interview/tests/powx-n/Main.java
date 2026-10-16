import java.util.*;

class Main {
    public static void main(String[] args) {
        // {x, n, expected}; results are compared with a tolerance because rounding differs between methods.
        double[][] cases = {
            {3.0, 4, 81.0},
            {2.0, -3, 0.125},
            {-1.5, 7, -17.0859375},
            {5.5, 0, 1.0},
            {2.0, Integer.MIN_VALUE, 0.0},
            {2.0, 10, 1024.0},
            {2.1, 3, 9.261},
            {0.5, 3, 0.125},
            {0.0, 5, 0.0},
            {0.0, 0, 1.0},
            {1.0, Integer.MAX_VALUE, 1.0},
            {-1.0, Integer.MAX_VALUE, -1.0},
            {-1.0, Integer.MIN_VALUE, 1.0},
            {2.0, -30, 9.313225746154785e-10},
            {1.5, 40, 11057332.320940012},
            {1.00001, 123456, 3.4368447520907104},
            {1.0000001, Integer.MAX_VALUE, 1.8366448196907325e93},
            {0.9999999, Integer.MAX_VALUE, 5.444595237395887e-94},
        };
        for (double[] c : cases) {
            int n = (int) c[1];
            double got = new Solution().myPow(c[0], n);
            boolean close = Math.abs(got - c[2]) <= 1e-6 * Math.max(1.0, Math.abs(c[2]));
            Check.eq(close, true, "myPow(" + c[0] + ", " + n + "): expected " + c[2] + ", got " + got);
        }
        Check.done();
    }
}
