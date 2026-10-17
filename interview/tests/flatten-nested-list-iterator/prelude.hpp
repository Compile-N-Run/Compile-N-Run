// LeetCode's NestedInteger for this problem: either one integer or a list of NestedIntegers.
class NestedInteger {
    bool isInt;
    int value;
    vector<NestedInteger> list;

public:
    NestedInteger() : isInt(false), value(0) {}  // an empty list
    NestedInteger(int value) : isInt(true), value(value) {}
    bool isInteger() const { return isInt; }
    int getInteger() const { return value; }
    void setInteger(int v) { isInt = true; value = v; list.clear(); }
    void add(const NestedInteger& ni) { isInt = false; list.push_back(ni); }
    const vector<NestedInteger>& getList() const { return list; }
};
