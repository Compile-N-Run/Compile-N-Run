import java.util.*;

class Main {
    public static void main(String[] args) {
        List<Integer> bigList = new ArrayList<>();
        for (int v = 0; v < 100; v++) for (int i = 0; i <= v; i++) bigList.add(v); // value v appears v + 1 times
        int[] big = bigList.stream().mapToInt(Integer::intValue).toArray();
        Object[][] cases = {{new int[] {5, 7, 5, 9, 7, 5}, 2, new int[] {5, 7}}, {new int[] {-3, -3, 4}, 1, new int[] {-3}},
            {new int[] {8, 2, 6}, 3, new int[] {2, 6, 8}}, {new int[] {1}, 1, new int[] {1}}, {new int[] {4, 4, 4, 4}, 1, new int[] {4}},
            {new int[] {-1, -1, 0, 0, 0, 2}, 2, new int[] {-1, 0}}, {big, 5, new int[] {95, 96, 97, 98, 99}}};
        for (Object[] c : cases) {
            int[] got = new Solution().topKFrequent(((int[]) c[0]).clone(), (int) c[1]);
            Arrays.sort(got);
            Check.eq(got, c[2], "size " + ((int[]) c[0]).length + " k=" + c[1]);
        }
        Check.done();
    }
}
