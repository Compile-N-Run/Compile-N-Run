int main() {
    // {x, n, expected}; results are compared with a tolerance because rounding differs between methods.
    struct Case { double x; int n; double expected; };
    vector<Case> cases = {
        {3.0, 4, 81.0},
        {2.0, -3, 0.125},
        {-1.5, 7, -17.0859375},
        {5.5, 0, 1.0},
        {2.0, INT_MIN, 0.0},
        {2.0, 10, 1024.0},
        {2.1, 3, 9.261},
        {0.5, 3, 0.125},
        {0.0, 5, 0.0},
        {0.0, 0, 1.0},
        {1.0, INT_MAX, 1.0},
        {-1.0, INT_MAX, -1.0},
        {-1.0, INT_MIN, 1.0},
        {2.0, -30, 9.313225746154785e-10},
        {1.5, 40, 11057332.320940012},
        {1.00001, 123456, 3.4368447520907104},
        {1.0000001, INT_MAX, 1.8366448196907325e93},
        {0.9999999, INT_MAX, 5.444595237395887e-94},
    };
    for (const Case& c : cases) {
        double got = Solution().myPow(c.x, c.n);
        bool close = fabs(got - c.expected) <= 1e-6 * max(1.0, fabs(c.expected));
        check(close, true, "myPow(" + to_string(c.x) + ", " + to_string(c.n) + "): expected " + to_string(c.expected) + ", got " + to_string(got));
    }
    return failures ? 1 : 0;
}
