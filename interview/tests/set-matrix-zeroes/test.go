package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	cases := []struct{ matrix, expected [][]int }{
		{[][]int{{1, 2, 3}, {4, 0, 6}, {7, 8, 9}}, [][]int{{1, 0, 3}, {0, 0, 0}, {7, 0, 9}}},
		{[][]int{{0, 5}, {7, 8}}, [][]int{{0, 0}, {0, 8}}},
		{[][]int{{1, 1, 1}, {0, 1, 1}}, [][]int{{0, 1, 1}, {0, 0, 0}}},
		{[][]int{{3, 4}, {5, 6}}, [][]int{{3, 4}, {5, 6}}},
		{[][]int{{0, 1, 2, 0}, {3, 4, 5, 2}, {1, 3, 1, 5}}, [][]int{{0, 0, 0, 0}, {0, 4, 5, 0}, {0, 3, 1, 0}}},
		{[][]int{{1}}, [][]int{{1}}},
		{[][]int{{0}}, [][]int{{0}}},
		{[][]int{{1, 0, 3}}, [][]int{{0, 0, 0}}},
		{[][]int{{1}, {0}, {3}}, [][]int{{0}, {0}, {0}}},
		{[][]int{{1, 0}, {1, 1}, {1, 1}}, [][]int{{0, 0}, {1, 0}, {1, 0}}},
		{[][]int{{-1, 5}, {0, -7}}, [][]int{{0, 5}, {0, 0}}},
		{[][]int{{1, 2, 3}, {4, 5, 6}, {7, 8, 0}}, [][]int{{1, 2, 0}, {4, 5, 0}, {0, 0, 0}}},
	}
	// 200 x 200 with zeros on the diagonal at every 50th row: rows and columns 0, 50, 100, 150 are cleared.
	big, bigWant := make([][]int, 200), make([][]int, 200)
	for r := 0; r < 200; r++ {
		big[r], bigWant[r] = make([]int, 200), make([]int, 200)
		for c := 0; c < 200; c++ {
			big[r][c], bigWant[r][c] = 1, 1
			if r == c && r%50 == 0 {
				big[r][c] = 0
			}
			if r%50 == 0 || c%50 == 0 {
				bigWant[r][c] = 0
			}
		}
	}
	cases = append(cases, struct{ matrix, expected [][]int }{big, bigWant})
	failed := false
	for n, c := range cases {
		work := make([][]int, len(c.matrix))
		for i, row := range c.matrix {
			work[i] = append([]int(nil), row...)
		}
		setZeroes(work)
		if !reflect.DeepEqual(work, c.expected) {
			fmt.Printf("case %d: expected %v, got %v\n", n, c.expected, work)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
