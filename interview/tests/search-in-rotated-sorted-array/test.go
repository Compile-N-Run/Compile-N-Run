package main

import (
	"fmt"
	"os"
)

func main() {
	failed := false
	expect := func(got, expected int, label string) {
		if got != expected {
			fmt.Println(label, "expected", expected, "got", got)
			failed = true
		}
	}
	cases := []struct {
		nums     []int
		target   int
		expected int
	}{{[]int{15, 18, 22, 3, 7, 11}, 7, 4}, {[]int{15, 18, 22, 3, 7, 11}, 20, -1}, {[]int{30, 40, 50, 10, 20}, 40, 1},
		{[]int{9}, 9, 0}, {[]int{9}, 4, -1}, {[]int{2, 1}, 1, 1}, {[]int{1, 2, 3, 4, 5}, 5, 4}, {[]int{5, 1, 3}, 5, 0},
		{[]int{5, 1, 3}, 3, 2}, {[]int{-8, -5, -10}, -10, 2}}
	for _, c := range cases {
		expect(search(append([]int(nil), c.nums...), c.target), c.expected, fmt.Sprint(c.nums, c.target))
	}
	// Exhaustive: every rotation of small arrays of even numbers, every target (odd ones are missing).
	for _, n := range []int{1, 2, 3, 7, 50} {
		for r := 0; r < n; r++ {
			nums := make([]int, n)
			for j := range nums {
				nums[j] = 2 * ((j + r) % n)
			}
			for t := -1; t <= 2*n; t++ {
				expected := -1
				if t >= 0 && t < 2*n && t%2 == 0 {
					expected = ((t/2-r)%n + n) % n
				}
				expect(search(nums, t), expected, fmt.Sprintf("n=%d r=%d t=%d", n, r, t))
			}
		}
	}
	big := make([]int, 5000)
	for i := range big {
		big[i] = (i + 1234) % 5000 // 5000 values, rotated
	}
	expect(search(big, 0), 3766, "big 0")
	expect(search(big, 4999), 3765, "big 4999")
	expect(search(big, 5000), -1, "big 5000")
	if failed {
		os.Exit(1)
	}
}
