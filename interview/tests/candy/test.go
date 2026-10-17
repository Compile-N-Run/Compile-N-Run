package main

import (
	"fmt"
	"os"
)

func main() {
	cases := []struct {
		ratings  []int
		expected int
	}{
		{[]int{1, 3, 2}, 4},
		{[]int{2, 2, 2}, 3},
		{[]int{5, 4, 3, 2}, 10},
		{[]int{1, 2, 2, 1}, 6},
		{[]int{7}, 1},
		{[]int{1, 0, 2}, 5},
		{[]int{1, 2, 3, 1}, 7},
		{[]int{1, 2, 87, 87, 87, 2, 1}, 13},
		{[]int{1, 2, 3, 4, 3, 2, 1}, 16},
	}
	var alternating, rising, slope []int
	for i := 0; i < 1000; i++ { // 1,2,1,2,... and 1+2+...+1000
		alternating = append(alternating, i%2)
		rising = append(rising, i)
	}
	for i := 0; i < 999; i++ { // a long slope down then up
		if i < 500 {
			slope = append(slope, 500-i)
		} else {
			slope = append(slope, i-499)
		}
	}
	cases = append(cases,
		struct {
			ratings  []int
			expected int
		}{alternating, 1500},
		struct {
			ratings  []int
			expected int
		}{rising, 500500},
		struct {
			ratings  []int
			expected int
		}{slope, 250000})
	failed := false
	for _, c := range cases {
		ratings := append([]int{}, c.ratings...)
		got := candy(ratings)
		if got != c.expected {
			head := c.ratings
			if len(head) > 8 {
				head = head[:8]
			}
			fmt.Printf("ratings=%v (%d children): expected %d, got %d\n", head, len(c.ratings), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
