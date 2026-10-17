package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	full := []int{} // complete tree of 1023 nodes: level d holds 2^d .. 2^(d+1) - 1
	fullWant := [][]int{}
	for i := 1; i <= 1023; i++ {
		full = append(full, i)
	}
	for d := 0; d < 10; d++ {
		level := []int{}
		for v := 1 << d; v < 2<<d; v++ {
			level = append(level, v)
		}
		if d%2 == 1 {
			for i, j := 0, len(level)-1; i < j; i, j = i+1, j-1 {
				level[i], level[j] = level[j], level[i]
			}
		}
		fullWant = append(fullWant, level)
	}
	chain, chainWant := []int{0}, [][]int{{0}} // 0 -> 1 -> ... -> 299 down the left side
	for i := 1; i < 300; i++ {
		chain = append(chain, i, NUL)
		chainWant = append(chainWant, []int{i})
	}
	cases := []struct {
		values   []int
		expected [][]int
	}{
		{[]int{}, [][]int{}},
		{[]int{8}, [][]int{{8}}},
		{[]int{1, 2, 3, 4, 5, 6, 7}, [][]int{{1}, {3, 2}, {4, 5, 6, 7}}},
		{[]int{4, 2, 7, 1, NUL, NUL, 9}, [][]int{{4}, {7, 2}, {1, 9}}},
		{[]int{1, 2, NUL, 3, NUL, 4}, [][]int{{1}, {2}, {3}, {4}}},
		{[]int{1, NUL, 2, NUL, 3}, [][]int{{1}, {2}, {3}}},
		{[]int{1, 2, 3, 4, NUL, NUL, 5, NUL, 6, 7}, [][]int{{1}, {3, 2}, {4, 5}, {7, 6}}},
		{[]int{0, -1, -2, -3, -4, -5, -6, -7}, [][]int{{0}, {-2, -1}, {-3, -4, -5, -6}, {-7}}},
		{full, fullWant},
		{chain, chainWant},
	}
	failed := false
	for n, c := range cases {
		got := zigzagLevelOrder(buildTree(c.values))
		if got == nil {
			got = [][]int{}
		}
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Printf("case %d (%d entries): expected %v, got %v\n", n, len(c.values), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
