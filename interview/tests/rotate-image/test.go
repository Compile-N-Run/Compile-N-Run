package main

import (
	"fmt"
	"os"
	"reflect"
)

func grid(n int) [][]int {
	m := make([][]int, n)
	for i := range m {
		m[i] = make([]int, n)
		for j := range m[i] {
			m[i][j] = i*n + j
		}
	}
	return m
}

// rotated is the reference answer: copy into a new matrix.
func rotated(m [][]int) [][]int {
	n := len(m)
	out := grid(n)
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			out[j][n-1-i] = m[i][j]
		}
	}
	return out
}

func main() {
	cases := []struct{ matrix, expected [][]int }{
		{[][]int{{1, 2}, {3, 4}}, [][]int{{3, 1}, {4, 2}}},
		{[][]int{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}, [][]int{{7, 4, 1}, {8, 5, 2}, {9, 6, 3}}},
		{[][]int{{5}}, [][]int{{5}}},
		{[][]int{{-1, 0}, {0, -1}}, [][]int{{0, -1}, {-1, 0}}},
		{[][]int{{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}, {13, 14, 15, 16}},
			[][]int{{13, 9, 5, 1}, {14, 10, 6, 2}, {15, 11, 7, 3}, {16, 12, 8, 4}}},
		{grid(5), rotated(grid(5))},
		{grid(20), rotated(grid(20))},
	}
	failed := false
	for _, c := range cases {
		m := make([][]int, len(c.matrix))
		for i, row := range c.matrix {
			m[i] = append([]int(nil), row...)
		}
		rotate(m)
		if !reflect.DeepEqual(m, c.expected) {
			fmt.Println(len(m), "x", len(m), "expected", c.expected, "got", m)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
