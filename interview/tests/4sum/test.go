package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
)

func normalise(quads [][]int) [][]int { // any order is valid: sort inside each quadruplet and sort the list
	out := make([][]int, len(quads))
	for i, q := range quads {
		out[i] = append([]int{}, q...)
		sort.Ints(out[i])
	}
	sort.Slice(out, func(i, j int) bool {
		for k := 0; k < 4; k++ {
			if out[i][k] != out[j][k] {
				return out[i][k] < out[j][k]
			}
		}
		return false
	})
	return out
}

type fourSumCase struct {
	nums     []int
	target   int
	expected [][]int
}

func main() {
	mod10 := []int{}
	mod10Want := [][]int{}
	for i := 0; i < 200; i++ {
		mod10 = append(mod10, i%10)
	}
	for a := 0; a < 10; a++ {
		for b := a; b < 10; b++ {
			for c := b; c < 10; c++ {
				for d := c; d < 10; d++ {
					if a+b+c+d == 18 {
						mod10Want = append(mod10Want, []int{a, b, c, d})
					}
				}
			}
		}
	}
	cases := []fourSumCase{
		{[]int{1, 0, -1, 0, -2, 2}, 0, [][]int{{-2, -1, 1, 2}, {-2, 0, 0, 2}, {-1, 0, 0, 1}}},
		{[]int{2, 2, 2, 2, 2}, 8, [][]int{{2, 2, 2, 2}}},
		{[]int{-3, -1, 0, 2, 4, 5}, 2, [][]int{{-3, -1, 2, 4}}},
		{[]int{1, 2, 3}, 6, [][]int{}},
		{[]int{}, 0, [][]int{}},
		{[]int{0, 0, 0, 0}, 0, [][]int{{0, 0, 0, 0}}},
		{[]int{0, 0, 0, 0}, 1, [][]int{}},
		{[]int{-5, -4, -3, -2, -1}, -10, [][]int{{-4, -3, -2, -1}}},
		{[]int{1, -2, -5, -4, -3, 3, 3, 5}, -11, [][]int{{-5, -4, -3, 1}}},
		{[]int{1000000000, 1000000000, 1000000000, 1000000000}, -294967296, [][]int{}}, // a 32-bit sum wraps to the target
		{[]int{-1000000000, -1000000000, 1000000000, 1000000000}, 0, [][]int{{-1000000000, -1000000000, 1000000000, 1000000000}}},
		{mod10, 18, mod10Want},
	}
	failed := false
	for n, c := range cases {
		got := normalise(fourSum(append([]int{}, c.nums...), c.target))
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Printf("case %d (length %d) target %d: expected %v, got %v\n", n, len(c.nums), c.target, c.expected, got)
			failed = true
		}
	}

	distinct := []int{} // 100 distinct values: 26536 quadruplets sum to 0
	for v := -50; v < 50; v++ {
		distinct = append(distinct, v)
	}
	got := fourSum(distinct, 0)
	if len(got) != 26536 {
		fmt.Printf("range(-50, 50) target 0: expected 26536 quadruplets, got %d\n", len(got))
		failed = true
	}
	seen := map[[4]int]bool{}
	valid := true
	for _, q := range normalise(got) {
		key := [4]int{q[0], q[1], q[2], q[3]}
		if seen[key] || q[0]+q[1]+q[2]+q[3] != 0 {
			valid = false
		}
		seen[key] = true
	}
	if !valid {
		fmt.Println("range(-50, 50) target 0: a quadruplet is repeated or does not sum to 0")
		failed = true
	}
	if failed {
		os.Exit(1)
	}
}
