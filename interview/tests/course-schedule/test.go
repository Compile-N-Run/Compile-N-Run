package main

import (
	"fmt"
	"os"
)

func main() {
	chain := [][]int{}
	for i := 1; i < 2000; i++ {
		chain = append(chain, []int{i, i - 1})
	}
	looped := append(append([][]int(nil), chain...), []int{0, 1999})
	cases := []struct {
		n        int
		prereq   [][]int
		expected bool
	}{{3, [][]int{{1, 0}, {2, 1}}, true}, {2, [][]int{{0, 1}, {1, 0}}, false}, {4, [][]int{}, true},
		{4, [][]int{{1, 0}, {2, 1}, {3, 2}, {1, 3}}, false}, {1, [][]int{}, true},
		{5, [][]int{{1, 0}, {2, 0}, {3, 1}, {3, 2}, {4, 3}}, true}, {3, [][]int{{0, 1}, {1, 2}, {2, 0}}, false},
		{2000, chain, true}, {2000, looped, false}}
	failed := false
	for i, c := range cases {
		if got := canFinish(c.n, c.prereq); got != c.expected {
			fmt.Println("case", i, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
