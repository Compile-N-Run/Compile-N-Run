package main

import (
	"fmt"
	"os"
)

// buildCycle builds the list and points the tail at node pos (-1 for no cycle).
func buildCycle(values []int, pos int) *ListNode {
	head := buildList(values)
	if pos >= 0 {
		tail, target := head, head
		for tail.Next != nil {
			tail = tail.Next
		}
		for i := 0; i < pos; i++ {
			target = target.Next
		}
		tail.Next = target
	}
	return head
}

func main() {
	big := []int{}
	for i := 0; i < 10000; i++ {
		big = append(big, i)
	}
	cases := []struct {
		values   []int
		pos      int
		expected bool
	}{{[]int{5, 8, 2, 9}, 1, true}, {[]int{1, 2}, 0, true}, {[]int{4, 4, 4}, -1, false}, {[]int{7}, 0, true}, {[]int{}, -1, false},
		{[]int{7}, -1, false}, {[]int{1, 2, 3, 4, 5}, 4, true}, {[]int{1, 2, 3, 4, 5, 6}, -1, false}, {[]int{3, 3, 3, 3}, 3, true},
		{big, -1, false}, {big, 5000, true}, {big, 0, true}, {big, 9999, true}}
	failed := false
	for n, c := range cases {
		if got := hasCycle(buildCycle(c.values, c.pos)); got != c.expected {
			fmt.Printf("case %d pos=%d: expected %v, got %v\n", n, c.pos, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
