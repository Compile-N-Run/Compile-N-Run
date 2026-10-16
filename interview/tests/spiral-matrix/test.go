package main

import (
	"fmt"
	"os"
	"reflect"
)

// spiralFilled returns an m x n matrix whose spiral order is 0, 1, 2, ... (filled by a turning walker).
func spiralFilled(m, n int) [][]int {
	grid := make([][]int, m)
	for i := range grid {
		grid[i] = make([]int, n)
		for j := range grid[i] {
			grid[i][j] = -1
		}
	}
	di, dj := []int{0, 1, 0, -1}, []int{1, 0, -1, 0}
	i, j, d := 0, 0, 0
	for v := 0; v < m*n; v++ {
		grid[i][j] = v
		ni, nj := i+di[d], j+dj[d]
		if ni < 0 || ni >= m || nj < 0 || nj >= n || grid[ni][nj] != -1 {
			d = (d + 1) % 4
			ni, nj = i+di[d], j+dj[d]
		}
		i, j = ni, nj
	}
	return grid
}

func main() {
	type tc struct {
		matrix   [][]int
		expected []int
	}
	cases := []tc{{[][]int{{10, 20, 30}, {40, 50, 60}, {70, 80, 90}}, []int{10, 20, 30, 60, 90, 80, 70, 40, 50}},
		{[][]int{{1, 2, 3, 4}, {5, 6, 7, 8}}, []int{1, 2, 3, 4, 8, 7, 6, 5}}, {[][]int{{7}, {8}, {9}}, []int{7, 8, 9}},
		{[][]int{{5}}, []int{5}}, {[][]int{{1, 2, 3}}, []int{1, 2, 3}}, {[][]int{{1, 2}, {3, 4}, {5, 6}}, []int{1, 2, 4, 6, 5, 3}},
		{[][]int{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}, {10, 11, 12}}, []int{1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5, 8}},
		{[][]int{{-1, -2}, {-3, -4}}, []int{-1, -2, -4, -3}}}
	for _, size := range [][2]int{{10, 7}, {7, 10}, {10, 10}} {
		expected := make([]int, size[0]*size[1])
		for k := range expected {
			expected[k] = k
		}
		cases = append(cases, tc{spiralFilled(size[0], size[1]), expected})
	}
	failed := false
	for _, c := range cases {
		got := spiralOrder(c.matrix)
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println(c.matrix, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
