package main

import (
	"fmt"
	"math"
	"os"
	"strconv"
)

func main() {
	cases := []struct{ x, expected int }{
		{123, 321},
		{-450, -54},
		{1200, 21},
		{1534236469, 0},  // 9646324351 is too large
		{math.MinInt32, 0}, // -8463847412 is too small
		{math.MaxInt32, 0}, // 7463847412 is too large
		{1463847412, 2147483641}, // fits, 6 below INT_MAX
		{-1463847412, -2147483641},
		{0, 0},
		{7, 7},
		{-120, -21},
		{1000000000, 1},
		{1000000003, 0}, // 3000000001 is too large
		{2147447412, 2147447412}, // a palindrome that fits
		{-2147447412, -2147447412},
		{1056389759, 0}, // 9579836501 is too large
		{2147483641, 1463847412},
		{1234567899, 0}, // 9987654321 is too large
	}
	// every ten-digit value in a stretch: whatever fits must be reversed exactly, the rest must give 0
	for x := 1463847400; x < 1463847500; x++ {
		digits := []byte(strconv.Itoa(x))
		for i, j := 0, len(digits)-1; i < j; i, j = i+1, j-1 {
			digits[i], digits[j] = digits[j], digits[i]
		}
		rev, _ := strconv.Atoi(string(digits))
		if rev > math.MaxInt32 {
			rev = 0
		}
		cases = append(cases, struct{ x, expected int }{x, rev}, struct{ x, expected int }{-x, -rev})
	}
	failed := false
	for _, c := range cases {
		if got := reverse(c.x); got != c.expected {
			fmt.Printf("x=%d: expected %d, got %d\n", c.x, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
