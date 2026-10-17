import java.util.*;

class Main {
    // Our implementation of LeetCode's NestedInteger interface.
    static class NI implements NestedInteger {
        Integer value;
        List<NestedInteger> list;
        NI(int value) { this.value = value; }
        NI() { list = new ArrayList<>(); }
        public boolean isInteger() { return list == null; }
        public Integer getInteger() { return value; }
        public List<NestedInteger> getList() { return list; }
    }

    // Parses "[[4,5],6,[7,[8]]]" (no spaces) into NestedIntegers; pos[0] is the read position.
    static NestedInteger parse(String s, int[] pos) {
        if (s.charAt(pos[0]) == '[') {
            NI list = new NI();
            pos[0]++;
            while (s.charAt(pos[0]) != ']') {
                list.list.add(parse(s, pos));
                if (s.charAt(pos[0]) == ',') pos[0]++;
            }
            pos[0]++;
            return list;
        }
        int sign = 1, value = 0;
        if (s.charAt(pos[0]) == '-') { sign = -1; pos[0]++; }
        while (pos[0] < s.length() && Character.isDigit(s.charAt(pos[0]))) value = value * 10 + (s.charAt(pos[0]++) - '0');
        return new NI(sign * value);
    }

    static List<NestedInteger> parseList(String s) { return parse(s, new int[] {0}).getList(); }

    static void flatten(List<NestedInteger> list, List<Integer> out) {
        for (NestedInteger ni : list) {
            if (ni.isInteger()) out.add(ni.getInteger());
            else flatten(ni.getList(), out);
        }
    }

    public static void main(String[] args) {
        StringBuilder big = new StringBuilder("[");
        for (int i = 0; i < 500; i++) big.append(i > 0 ? "," : "").append(i).append(",[[").append(i).append("],[]]"); // 1000 integers, half of them nested
        big.append("]");
        String deep = "[" + "[".repeat(200) + "42" + "]".repeat(200) + "]"; // one integer wrapped in 200 lists
        String[] cases = {"[[4,5],6,[7,[8]]]", "[1,[2,[3,[4,[5]]]]]", "[[],[[]],9]", "[]", "[[[]]]", "[9]",
            "[[[[-7]]],0,[],[3]]", "[[2,2],3,[2,2]]", big.toString(), deep};
        for (String spec : cases) {
            List<NestedInteger> list = parseList(spec);
            List<Integer> expected = new ArrayList<>();
            flatten(list, expected);
            NestedIterator it = new NestedIterator(list);
            List<Integer> got = new ArrayList<>();
            while (it.hasNext()) got.add(it.next());
            Check.eq(got, expected, spec.length() <= 40 ? spec : spec.substring(0, 40) + "...");
        }
        // hasNext must not consume anything, however often it is called
        NestedIterator it = new NestedIterator(parseList("[[],5]"));
        Check.eq(Arrays.asList(it.hasNext(), it.hasNext(), it.hasNext()), Arrays.asList(true, true, true), "[[],5] hasNext three times");
        Check.eq(it.next(), 5, "[[],5] next after repeated hasNext");
        Check.eq(it.hasNext(), false, "[[],5] hasNext at the end");
        Check.done();
    }
}
