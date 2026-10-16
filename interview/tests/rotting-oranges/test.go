package main

import (
	"fmt"
	"os"
)

func filled(m, n, v int) [][]int {
	g := make([][]int, m)
	for i := range g {
		g[i] = make([]int, n)
		for j := range g[i] {
			g[i][j] = v
		}
	}
	return g
}

func main() {
	big := filled(10, 10, 1)
	big[0][0] = 2 // the far corner is 18 steps away
	cases := []struct {
		grid     [][]int
		expected int
	}{{[][]int{{2, 1, 0}, {1, 1, 1}, {0, 1, 1}}, 4}, {[][]int{{2, 1, 1, 1, 2}}, 2}, {[][]int{{1, 0, 2}}, -1},
		{[][]int{{0, 2}, {0, 0}}, 0}, {[][]int{{1}}, -1}, {[][]int{{0}}, 0}, {[][]int{{2, 2}, {1, 1}, {0, 1}}, 2},
		{big, 18}, {filled(10, 10, 1), -1}}
	failed := false
	for _, c := range cases {
		label := fmt.Sprint(c.grid)
		if got := orangesRotting(c.grid); got != c.expected {
			fmt.Println(label, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
