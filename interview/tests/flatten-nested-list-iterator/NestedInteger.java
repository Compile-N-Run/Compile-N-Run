import java.util.*;

// LeetCode's NestedInteger interface for this problem (the judge supplies the implementation; Main.java has ours).
public interface NestedInteger {
    // @return true if this NestedInteger holds a single integer, rather than a nested list.
    public boolean isInteger();

    // @return the single integer that this NestedInteger holds, if it holds a single integer; null otherwise.
    public Integer getInteger();

    // @return the nested list that this NestedInteger holds, if it holds a nested list; null otherwise.
    public List<NestedInteger> getList();
}
