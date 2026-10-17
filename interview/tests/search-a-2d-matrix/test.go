package main

import (
	"fmt"
	"os"
)

func main() {
	grid := [][]int{{2, 4, 6}, {9, 11, 13}, {20, 25, 30}}
	cases := []struct {
		matrix   [][]int
		target   int
		expected bool
	}{
		{grid, 11, true},
		{grid, 12, false},
		{grid, 2, true},
		{grid, 30, true},
		{grid, 1, false},
		{grid, 31, false},
		{grid, 9, true},
		{[][]int{{7}}, 7, true},
		{[][]int{{7}}, 8, false},
		{[][]int{{1, 2, 3, 4, 5}}, 4, true}, // a single row
		{[][]int{{1, 2, 3, 4, 5}}, 0, false},
		{[][]int{{1}, {3}, {5}}, 3, true}, // a single column
		{[][]int{{1}, {3}, {5}}, 4, false},
		{[][]int{{-9, -7}, {-5, -3}, {-1, 0}}, -3, true}, // negatives
		{[][]int{{-9, -7}, {-5, -3}, {-1, 0}}, -4, false},
	}
	failed := false
	for n, c := range cases {
		if got := searchMatrix(c.matrix, c.target); got != c.expected {
			fmt.Println("case", n, "target", c.target, "expected", c.expected, "got", got)
			failed = true
		}
	}

	// Larger case: a 100 x 100 matrix of even numbers; every even value is found and no odd one is.
	big := make([][]int, 100)
	for i := range big {
		big[i] = make([]int, 100)
		for j := range big[i] {
			big[i][j] = 2 * (i*100 + j)
		}
	}
	for k := 0; k < 10000; k++ {
		if !searchMatrix(big, 2*k) {
			fmt.Println("100x100: even value", 2*k, "not found")
			failed = true
		}
		if searchMatrix(big, 2*k+1) {
			fmt.Println("100x100: odd value", 2*k+1, "reported present")
			failed = true
		}
	}
	if searchMatrix(big, 20000) {
		fmt.Println("100x100: target past the end reported present")
		failed = true
	}
	if failed {
		os.Exit(1)
	}
}
