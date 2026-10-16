package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
)

func normalise(lists [][]int) [][]int {
	out := make([][]int, len(lists))
	for i, s := range lists {
		out[i] = append([]int{}, s...)
		sort.Ints(out[i])
	}
	sort.Slice(out, func(a, b int) bool {
		for i := 0; i < len(out[a]) && i < len(out[b]); i++ {
			if out[a][i] != out[b][i] {
				return out[a][i] < out[b][i]
			}
		}
		return len(out[a]) < len(out[b])
	})
	return out
}

func main() {
	failed := false
	three := [][]int{{}, {1}, {1, 2}, {1, 2, 3}, {1, 3}, {2}, {2, 3}, {3}}
	exact := []struct {
		nums     []int
		expected [][]int
	}{
		{[]int{1, 2, 3}, three},
		{[]int{3, 1, 2}, three},
		{[]int{}, [][]int{{}}},
		{[]int{0}, [][]int{{}, {0}}},
		{[]int{-1, 4}, [][]int{{}, {-1}, {-1, 4}, {4}}},
		{[]int{5, -2, 7, 0}, [][]int{{}, {-2}, {-2, 0}, {-2, 0, 5}, {-2, 0, 5, 7}, {-2, 0, 7}, {-2, 5}, {-2, 5, 7}, {-2, 7},
			{0}, {0, 5}, {0, 5, 7}, {0, 7}, {5}, {5, 7}, {7}}},
	}
	for _, c := range exact {
		got := normalise(subsets(append([]int{}, c.nums...)))
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println(c.nums, "expected", c.expected, "got", got)
			failed = true
		}
	}
	// Larger inputs: 2^n distinct subsets, each made of distinct elements of nums.
	ten, twelve := []int{}, []int{}
	for i := 1; i <= 10; i++ {
		ten = append(ten, i)
	}
	for i := -6; i < 6; i++ {
		twelve = append(twelve, i)
	}
	for _, nums := range [][]int{ten, twelve} {
		got := subsets(append([]int{}, nums...))
		want := 1 << len(nums)
		seen := map[string]bool{}
		for _, s := range normalise(got) {
			seen[fmt.Sprint(s)] = true
		}
		if len(got) != want || len(seen) != want {
			fmt.Println(nums, "expected", want, "distinct subsets, got", len(got), len(seen))
			failed = true
		}
		allowed := map[int]bool{}
		for _, v := range nums {
			allowed[v] = true
		}
		for _, s := range got {
			elems := map[int]bool{}
			for _, v := range s {
				elems[v] = true
				if !allowed[v] {
					fmt.Println(nums, "invalid subset:", s)
					failed = true
				}
			}
			if len(elems) != len(s) {
				fmt.Println(nums, "duplicate element in subset:", s)
				failed = true
			}
		}
	}
	if failed {
		os.Exit(1)
	}
}
