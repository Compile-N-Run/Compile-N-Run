// Build the list and point the tail at node `pos` (-1 for no cycle).
static ListNode* buildCycle(const vector<int>& values, int pos) {
    ListNode* head = buildList(values);
    if (pos >= 0) {
        ListNode *tail = head, *target = head;
        while (tail->next) tail = tail->next;
        for (int i = 0; i < pos; i++) target = target->next;
        tail->next = target;
    }
    return head;
}

int main() {
    vector<int> big;
    for (int i = 0; i < 10000; i++) big.push_back(i);
    struct Case { vector<int> values; int pos; bool expected; };
    vector<Case> cases = {{{5, 8, 2, 9}, 1, true}, {{1, 2}, 0, true}, {{4, 4, 4}, -1, false}, {{7}, 0, true}, {{}, -1, false},
        {{7}, -1, false}, {{1, 2, 3, 4, 5}, 4, true}, {{1, 2, 3, 4, 5, 6}, -1, false}, {{3, 3, 3, 3}, 3, true},
        {big, -1, false}, {big, 5000, true}, {big, 0, true}, {big, 9999, true}};
    for (size_t n = 0; n < cases.size(); n++) {
        check(Solution().hasCycle(buildCycle(cases[n].values, cases[n].pos)), cases[n].expected,
              "case " + to_string(n) + " pos=" + to_string(cases[n].pos));
    }
    return failures ? 1 : 0;
}
