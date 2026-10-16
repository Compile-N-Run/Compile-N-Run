import java.util.*;

class Main {
    public static void main(String[] args) {
        // 1. The write-up's example.
        RandomizedSet s = new RandomizedSet();
        Check.eq(s.insert(4), true, "insert 4");
        Check.eq(s.insert(4), false, "insert 4 again");
        Check.eq(s.insert(-2), true, "insert -2");
        int r = s.getRandom();
        Check.eq(r == 4 || r == -2, true, "random of {4,-2}");
        Check.eq(s.remove(4), true, "remove 4");
        Check.eq(s.remove(4), false, "remove 4 again");
        Check.eq(s.getRandom(), -2, "only -2 left");

        // 2. Empty set, single element, re-insert after removal.
        s = new RandomizedSet();
        Check.eq(s.remove(0), false, "remove from empty");
        Check.eq(s.insert(0), true, "insert 0");
        Check.eq(s.getRandom(), 0, "single 0");
        Check.eq(s.remove(0), true, "remove 0");
        Check.eq(s.insert(0), true, "re-insert 0");

        // 3. 32-bit limits and removing the last array element.
        s = new RandomizedSet();
        Check.eq(s.insert(Integer.MIN_VALUE), true, "insert min");
        Check.eq(s.insert(Integer.MAX_VALUE), true, "insert max");
        Check.eq(s.remove(Integer.MAX_VALUE), true, "remove max (last slot)");
        Check.eq(s.getRandom(), Integer.MIN_VALUE, "only min left");

        // 4. Every member is returned at least once, and nothing else.
        s = new RandomizedSet();
        Set<Integer> members = new HashSet<>(), seen = new HashSet<>();
        for (int v = -5; v < 5; v++) { members.add(v); s.insert(v); }
        for (int t = 0; t < 2000; t++) {
            int x = s.getRandom();
            Check.eq(members.contains(x), true, x + " is a member");
            seen.add(x);
        }
        Check.eq(seen, members, "all members returned");

        // 5. Larger case: insert 0..9999, remove the even numbers.
        s = new RandomizedSet();
        for (int v = 0; v < 10000; v++) Check.eq(s.insert(v), true, "insert " + v);
        for (int v = 0; v < 10000; v += 2) Check.eq(s.remove(v), true, "remove " + v);
        for (int v = 0; v < 10000; v += 2) Check.eq(s.remove(v), false, "remove again " + v);
        for (int t = 0; t < 1000; t++) Check.eq(s.getRandom() % 2, 1, "only odd values left");

        // 6. Random operations compared with a reference set.
        s = new RandomizedSet();
        Set<Integer> model = new HashSet<>();
        long state = 12345;
        for (int step = 0; step < 20000; step++) {
            state = (state * 1103515245L + 12345) % 2147483648L;
            int op = (int) (state % 3), v = (int) ((state >> 8) % 50);
            if (op == 0) { Check.eq(s.insert(v), !model.contains(v), "insert step " + step); model.add(v); }
            else if (op == 1) { Check.eq(s.remove(v), model.contains(v), "remove step " + step); model.remove(v); }
            else if (!model.isEmpty()) Check.eq(model.contains(s.getRandom()), true, "getRandom step " + step);
        }
        Check.done();
    }
}
