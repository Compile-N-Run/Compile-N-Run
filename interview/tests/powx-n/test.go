package main

import (
	"fmt"
	"math"
	"os"
)

func main() {
	// Results are compared with a tolerance because rounding differs between methods.
	cases := []struct {
		x        float64
		n        int
		expected float64
	}{
		{3.0, 4, 81.0},
		{2.0, -3, 0.125},
		{-1.5, 7, -17.0859375},
		{5.5, 0, 1.0},
		{2.0, math.MinInt32, 0.0},
		{2.0, 10, 1024.0},
		{2.1, 3, 9.261},
		{0.5, 3, 0.125},
		{0.0, 5, 0.0},
		{0.0, 0, 1.0},
		{1.0, math.MaxInt32, 1.0},
		{-1.0, math.MaxInt32, -1.0},
		{-1.0, math.MinInt32, 1.0},
		{2.0, -30, 9.313225746154785e-10},
		{1.5, 40, 11057332.320940012},
		{1.00001, 123456, 3.4368447520907104},
		{1.0000001, math.MaxInt32, 1.8366448196907325e93},
		{0.9999999, math.MaxInt32, 5.444595237395887e-94},
	}
	failed := false
	for _, c := range cases {
		got := myPow(c.x, c.n)
		if math.Abs(got-c.expected) > 1e-6*math.Max(1, math.Abs(c.expected)) {
			fmt.Printf("myPow(%v, %d): expected %v, got %v\n", c.x, c.n, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
