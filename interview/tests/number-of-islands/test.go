package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	full, board := []string{}, []string{}
	for r := 0; r < 300; r++ {
		full = append(full, strings.Repeat("1", 300))
		row := make([]byte, 300)
		for c := range row {
			row[c] = '0'
			if (r+c)%2 == 0 {
				row[c] = '1'
			}
		}
		board = append(board, string(row))
	}
	cases := []struct {
		rows     []string
		expected int
	}{{[]string{"110", "010", "001"}, 2}, {[]string{"101", "010", "101"}, 5}, {[]string{"000"}, 0},
		{[]string{"1111", "1001", "1111"}, 1}, {[]string{"1"}, 1}, {[]string{"10", "01", "10"}, 3},
		{[]string{"1", "1", "0", "1"}, 2}, {full, 1}, {board, 45000}}
	failed := false
	for n, c := range cases {
		grid := make([][]byte, len(c.rows))
		for i, row := range c.rows {
			grid[i] = []byte(row)
		}
		if got := numIslands(grid); got != c.expected {
			fmt.Printf("case %d: expected %d, got %d\n", n, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
