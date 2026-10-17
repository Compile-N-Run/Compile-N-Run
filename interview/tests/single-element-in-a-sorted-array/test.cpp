// Pairs 0,0,1,1,...,n-1,n-1 with the lone value `single` kept once, in sorted order.
static vector<int> withSingle(int n, int single) {
    vector<int> values;
    for (int v = 0; v < n; v++) {
        values.push_back(v);
        if (v != single) values.push_back(v);
    }
    return values;
}

int main() {
    vector<pair<vector<int>, int>> cases = {
        {{1, 1, 2, 3, 3, 4, 4}, 2},
        {{0, 0, 5, 5, 9}, 9},
        {{2, 3, 3}, 2},
        {{-4, -4, -1, -1, 0, 6, 6}, 0},
        {{7}, 7},
        {{1, 1, 2, 2, 3}, 3},
        {{1, 2, 2, 3, 3}, 1},
        {{1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6}, 3},
        {{-7, -7, -3, -3, -2, -1, -1}, -2},
        {withSingle(1000, 0), 0},      // the lone value first among 1999 elements
        {withSingle(1000, 999), 999},  // the lone value last
        {withSingle(1000, 617), 617},  // the lone value somewhere in the middle
    };
    for (auto& c : cases) {
        vector<int> nums = c.first;
        int got = Solution().singleNonDuplicate(nums);
        string label = "nums=[";
        for (size_t i = 0; i < min<size_t>(8, c.first.size()); i++) label += (i ? "," : "") + to_string(c.first[i]);
        label += (c.first.size() > 8 ? ",...] (" : "] (") + to_string(c.first.size()) + " elements)";
        check(got, c.second, label);
    }
    return failures ? 1 : 0;
}
