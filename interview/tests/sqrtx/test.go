package main

import (
	"fmt"
	"os"
)

func main() {
	cases := []struct{ x, expected int }{
		{0, 0},
		{1, 1},
		{2, 1},
		{3, 1},
		{4, 2},
		{8, 2},
		{9, 3},
		{15, 3},
		{16, 4},
		{24, 4},
		{25, 5},
		{99, 9},
		{100, 10},
		{1000000, 1000},
		{999999, 999},
		{2147302921, 46339}, // 46339 squared
		{2147395599, 46339},
		{2147395600, 46340}, // 46340 squared
		{2147395601, 46340},
		{2147483647, 46340},
	}
	failed := false
	for _, c := range cases {
		if got := mySqrt(c.x); got != c.expected {
			fmt.Printf("x=%d: expected %d, got %d\n", c.x, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
