package main

import (
	"fmt"
	"os"
	"reflect"
)

type kGroupCase struct {
	values   []int
	k        int
	expected []int
}

func main() {
	cases := []kGroupCase{{[]int{10, 20, 30, 40, 50, 60, 70}, 3, []int{30, 20, 10, 60, 50, 40, 70}}, {[]int{1, 2, 3, 4}, 4, []int{4, 3, 2, 1}},
		{[]int{5, 6, 7, 8, 9}, 2, []int{6, 5, 8, 7, 9}}, {[]int{1, 2, 3}, 1, []int{1, 2, 3}}, {[]int{42}, 1, []int{42}},
		{[]int{1, 2, 3, 4, 5, 6}, 3, []int{3, 2, 1, 6, 5, 4}}, {[]int{0, 0, 1, 1, 2}, 2, []int{0, 0, 1, 1, 2}}}
	// Larger cases: 5000 nodes in groups of 7 (2 left over) and one group of 5000.
	big, expected7, reversed := make([]int, 5000), make([]int, 5000), make([]int, 5000)
	for i := range big {
		big[i], reversed[i] = i, 4999-i
		start := i / 7 * 7
		if start+7 <= 5000 {
			expected7[i] = start + 6 - (i - start)
		} else {
			expected7[i] = i
		}
	}
	cases = append(cases, kGroupCase{big, 7, expected7}, kGroupCase{big, 5000, reversed})
	failed := false
	for _, c := range cases {
		got := listValues(reverseKGroup(buildList(c.values), c.k))
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println("size", len(c.values), "k", c.k, "wrong answer")
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
