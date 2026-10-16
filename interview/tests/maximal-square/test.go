package main

import (
	"fmt"
	"os"
	"strings"
)

func toGrid(rows []string) [][]byte {
	grid := make([][]byte, len(rows))
	for i, r := range rows {
		grid[i] = []byte(r)
	}
	return grid
}

func main() {
	big := make([]string, 100)
	for i := range big {
		big[i] = strings.Repeat("1", 100)
	}
	big[50] = strings.Repeat("0", 100)
	cases := []struct {
		rows     []string
		expected int
	}{{[]string{"110", "111", "011"}, 4}, {[]string{"00", "00"}, 0}, {[]string{"1"}, 1}, {[]string{"1111", "1111", "1110"}, 9},
		{[]string{"0"}, 0}, {[]string{"10111"}, 1}, {[]string{"01", "10"}, 1}, {[]string{"10111", "11111", "01111", "11110"}, 9},
		{big, 2500}}
	failed := false
	for _, c := range cases {
		if got := maximalSquare(toGrid(c.rows)); got != c.expected {
			fmt.Println(c.rows[0], "... expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
