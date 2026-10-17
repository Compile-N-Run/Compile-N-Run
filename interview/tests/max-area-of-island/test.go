package main

import (
	"fmt"
	"os"
)

type islandCase struct {
	grid     [][]int
	expected int
}

func build(f func(r, c int) int) [][]int {
	grid := make([][]int, 50)
	for r := range grid {
		grid[r] = make([]int, 50)
		for c := range grid[r] {
			grid[r][c] = f(r, c)
		}
	}
	return grid
}

func b2i(b bool) int {
	if b {
		return 1
	}
	return 0
}

func main() {
	cases := []islandCase{
		{[][]int{{0, 1, 1, 0}, {0, 1, 0, 0}, {1, 0, 0, 1}}, 3},
		{[][]int{{1, 0, 1}, {0, 1, 0}, {1, 0, 1}}, 1},
		{[][]int{{1, 1, 1}, {1, 1, 1}}, 6},
		{[][]int{{0, 0}, {0, 0}}, 0},
		{[][]int{{1}}, 1},
		{[][]int{{0}}, 0},
		{[][]int{{1, 1, 0, 0, 0}, {1, 1, 0, 1, 1}, {0, 0, 0, 1, 1}, {0, 1, 0, 0, 1}}, 5},
		{[][]int{{1, 0, 1, 1, 1, 0, 1}}, 3},
		{build(func(r, c int) int { return 1 }), 2500},
		{build(func(r, c int) int { return (r + c) % 2 }), 1},                        // every 1 touches only diagonally
		{build(func(r, c int) int { return b2i(r%2 == 0) }), 50},                     // 25 separate rows of 50
		{build(func(r, c int) int { return b2i(r == 0 || c%2 == 0) }), 50 + 25*49},   // one island: a top bar with 25 teeth
	}
	failed := false
	for n, c := range cases {
		copied := make([][]int, len(c.grid))
		for i, row := range c.grid {
			copied[i] = append([]int(nil), row...)
		}
		if got := maxAreaOfIsland(copied); got != c.expected {
			fmt.Printf("case %d (%dx%d): expected %d, got %d\n", n, len(c.grid), len(c.grid[0]), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
