package main

import (
	"fmt"
	"os"
)

func main() {
	cases := []struct {
		matrix   [][]int
		expected int
	}{
		{[][]int{{1, 2, 3}, {6, 5, 4}, {7, 8, 9}}, 9},
		{[][]int{{9, 1}, {8, 2}}, 4},
		{[][]int{{5, 5}, {5, 5}}, 1},
		{[][]int{{7}}, 1},
		{[][]int{{3, 4, 5}, {3, 2, 6}, {2, 2, 1}}, 4},
		{[][]int{{-3, -2}, {0, -1}}, 4},
		{[][]int{{1, 2}, {2, 1}}, 2},
		{[][]int{{10, 9, 8, 7, 6, 5, 4, 3, 2, 1}}, 10},
	}
	ordered := make([][]int, 200) // only right/down steps: 199 + 199 + 1
	for r := range ordered {
		ordered[r] = make([]int, 200)
		for c := range ordered[r] {
			ordered[r][c] = r*200 + c
		}
	}
	snake := make([][]int, 20) // one increasing path that covers every cell
	for r := range snake {
		snake[r] = make([]int, 20)
		for c := range snake[r] {
			if r%2 == 0 {
				snake[r][c] = r*20 + c
			} else {
				snake[r][c] = r*20 + 19 - c
			}
		}
	}
	cases = append(cases, struct {
		matrix   [][]int
		expected int
	}{ordered, 399}, struct {
		matrix   [][]int
		expected int
	}{snake, 400})
	failed := false
	for n, c := range cases {
		copied := make([][]int, len(c.matrix))
		for i, row := range c.matrix {
			copied[i] = append([]int(nil), row...)
		}
		if got := longestIncreasingPath(copied); got != c.expected {
			fmt.Printf("case %d (%dx%d): expected %d, got %d\n", n, len(c.matrix), len(c.matrix[0]), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
