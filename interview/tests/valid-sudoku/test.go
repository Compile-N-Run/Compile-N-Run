package main

import (
	"fmt"
	"os"
)

func main() {
	E := "........."
	cases := []struct {
		label    string
		rows     []string
		expected bool
	}{
		{"empty board", []string{E, E, E, E, E, E, E, E, E}, true},
		{"two 5s in row 0", []string{"5.......5", E, E, E, E, E, E, E, E}, false},
		{"two 9s in the centre box", []string{E, E, E, "...9.....", E, ".....9...", E, E, E}, false},
		{"valid but unsolvable", []string{"12345678.", "........9", E, E, E, E, E, E, E}, true},
		{"two 3s in column 4", []string{E, "....3....", E, E, E, E, E, "....3....", E}, false},
		{"full solved grid", []string{"123456789", "456789123", "789123456", "234567891", "567891234",
			"891234567", "345678912", "678912345", "912345678"}, true},
		{"partly filled valid grid", []string{"...45..8.", ".5.7.9.23", ".89.23..6", ".3456.8.1", "5...9.2..",
			"..1234567", "3.56789.2", "6..91.3..", ".12.4.6.8"}, true},
		{"full grid with one wrong cell", []string{"123456789", "456789123", "789123456", "234567891", "567891234",
			"891234567", "345678912", "678912345", "912345677"}, false},
	}
	failed := false
	for _, c := range cases {
		board := make([][]byte, 9)
		for r, row := range c.rows {
			board[r] = []byte(row)
		}
		if got := isValidSudoku(board); got != c.expected {
			fmt.Println(c.label, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
