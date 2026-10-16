int main() {
    // 1. The write-up's example.
    {
        RandomizedSet s;
        check(s.insert(4), true, "insert 4");
        check(s.insert(4), false, "insert 4 again");
        check(s.insert(-2), true, "insert -2");
        int r = s.getRandom();
        check(r == 4 || r == -2, true, "random of {4,-2}");
        check(s.remove(4), true, "remove 4");
        check(s.remove(4), false, "remove 4 again");
        check(s.getRandom(), -2, "only -2 left");
    }
    // 2. Empty set, single element, re-insert after removal.
    {
        RandomizedSet s;
        check(s.remove(0), false, "remove from empty");
        check(s.insert(0), true, "insert 0");
        check(s.getRandom(), 0, "single 0");
        check(s.remove(0), true, "remove 0");
        check(s.insert(0), true, "re-insert 0");
    }
    // 3. 32-bit limits and removing the last array element.
    {
        RandomizedSet s;
        check(s.insert(INT_MIN), true, "insert min");
        check(s.insert(INT_MAX), true, "insert max");
        check(s.remove(INT_MAX), true, "remove max (last slot)");
        check(s.getRandom(), INT_MIN, "only min left");
    }
    // 4. Every member is returned at least once, and nothing else.
    {
        RandomizedSet s;
        set<int> members, seen;
        for (int v = -5; v < 5; v++) { members.insert(v); s.insert(v); }
        for (int t = 0; t < 2000; t++) {
            int r = s.getRandom();
            check(members.count(r) == 1, true, to_string(r) + " is a member");
            seen.insert(r);
        }
        check(seen, members, "all members returned");
    }
    // 5. Larger case: insert 0..9999, remove the even numbers.
    {
        RandomizedSet s;
        for (int v = 0; v < 10000; v++) check(s.insert(v), true, "insert " + to_string(v));
        for (int v = 0; v < 10000; v += 2) check(s.remove(v), true, "remove " + to_string(v));
        for (int v = 0; v < 10000; v += 2) check(s.remove(v), false, "remove again " + to_string(v));
        for (int t = 0; t < 1000; t++) check(s.getRandom() % 2, 1, "only odd values left");
    }
    // 6. Random operations compared with a reference set.
    {
        RandomizedSet s;
        set<int> model;
        long long state = 12345;
        for (int step = 0; step < 20000; step++) {
            state = (state * 1103515245LL + 12345) % 2147483648LL;
            int op = state % 3, v = (state >> 8) % 50;
            if (op == 0) { check(s.insert(v), model.count(v) == 0, "insert step " + to_string(step)); model.insert(v); }
            else if (op == 1) { check(s.remove(v), model.count(v) == 1, "remove step " + to_string(step)); model.erase(v); }
            else if (!model.empty()) check(model.count(s.getRandom()) == 1, true, "getRandom step " + to_string(step));
        }
    }
    return failures ? 1 : 0;
}
