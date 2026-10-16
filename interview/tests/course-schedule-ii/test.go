package main

import (
	"fmt"
	"os"
)

// valid accepts any topological order; an impossible schedule must give an empty slice.
func valid(n int, prereq [][]int, order []int, possible bool) bool {
	if !possible {
		return len(order) == 0
	}
	if len(order) != n {
		return false
	}
	pos := make([]int, n)
	for i := range pos {
		pos[i] = -1
	}
	for i, c := range order {
		if c < 0 || c >= n || pos[c] != -1 {
			return false
		}
		pos[c] = i
	}
	for _, p := range prereq {
		if pos[p[1]] > pos[p[0]] {
			return false
		}
	}
	return true
}

func main() {
	chain := [][]int{} // course i before course i - 1
	for i := 1; i < 2000; i++ {
		chain = append(chain, []int{i - 1, i})
	}
	looped := append(append([][]int(nil), chain...), []int{1999, 0})
	cases := []struct {
		n        int
		prereq   [][]int
		possible bool
	}{{3, [][]int{{1, 0}, {2, 1}}, true}, {4, [][]int{{1, 0}, {2, 0}, {3, 1}, {3, 2}}, true},
		{3, [][]int{{0, 2}, {2, 0}}, false}, {3, [][]int{}, true}, {1, [][]int{}, true},
		{3, [][]int{{0, 1}, {1, 2}, {2, 0}}, false}, {6, [][]int{{5, 4}, {4, 3}, {0, 5}, {2, 1}}, true},
		{2000, chain, true}, {2000, looped, false}}
	failed := false
	for i, c := range cases {
		copied := make([][]int, len(c.prereq))
		for k, p := range c.prereq {
			copied[k] = append([]int(nil), p...)
		}
		got := findOrder(c.n, copied)
		if !valid(c.n, c.prereq, got, c.possible) {
			fmt.Println("case", i, "invalid order", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
