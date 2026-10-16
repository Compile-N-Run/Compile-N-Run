package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
)

func normalise(combos [][]int) [][]int {
	out := [][]int{} // never nil, so an empty answer compares equal to [][]int{}
	for _, c := range combos {
		c = append([]int(nil), c...)
		sort.Ints(c)
		out = append(out, c)
	}
	sort.Slice(out, func(a, b int) bool {
		x, y := out[a], out[b]
		for i := 0; i < len(x) && i < len(y); i++ {
			if x[i] != y[i] {
				return x[i] < y[i]
			}
		}
		return len(x) < len(y)
	})
	return out
}

func main() {
	cases := []struct {
		candidates []int
		target     int
		expected   [][]int
	}{{[]int{3, 4, 5}, 8, [][]int{{3, 5}, {4, 4}}}, {[]int{6, 3, 9}, 9, [][]int{{3, 3, 3}, {3, 6}, {9}}}, {[]int{2}, 6, [][]int{{2, 2, 2}}},
		{[]int{5}, 3, [][]int{}}, {[]int{2, 3, 5}, 12, [][]int{{2, 2, 2, 2, 2, 2}, {2, 2, 2, 3, 3}, {2, 2, 3, 5}, {2, 5, 5}, {3, 3, 3, 3}}},
		{[]int{7}, 7, [][]int{{7}}}, {[]int{40, 2}, 1, [][]int{}}}
	failed := false
	for _, c := range cases {
		got := normalise(combinationSum(append([]int(nil), c.candidates...), c.target))
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println(c.candidates, c.target, "expected", c.expected, "got", got)
			failed = true
		}
	}
	// Larger case: 45 distinct combinations, each summing to 30 and using only the candidates.
	big := normalise(combinationSum([]int{7, 3, 2, 5}, 30))
	seen := map[string]bool{}
	for _, c := range big {
		sum := 0
		for _, x := range c {
			sum += x
			if x != 2 && x != 3 && x != 5 && x != 7 {
				failed = true
			}
		}
		if sum != 30 {
			failed = true
		}
		seen[fmt.Sprint(c)] = true
	}
	if len(big) != 45 || len(seen) != 45 {
		fmt.Println("[7 3 2 5] 30: expected 45 distinct combinations, got", len(big), "with", len(seen), "distinct")
		failed = true
	}
	if failed {
		os.Exit(1)
	}
}
