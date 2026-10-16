package main

import (
	"fmt"
	"os"
	"sort"
)

// lcExpand is an independent iterative reference: extend every prefix by each letter of the next digit.
func lcExpand(digits string) []string {
	keys := []string{"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"}
	if digits == "" {
		return []string{}
	}
	out := []string{""}
	for _, d := range digits {
		next := []string{}
		for _, s := range out {
			for _, ch := range keys[d-'0'] {
				next = append(next, s+string(ch))
			}
		}
		out = next
	}
	sort.Strings(out)
	return out
}

func sameStrings(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func main() {
	failed := len(lcExpand("29")) != 12 || len(lcExpand("7979")) != 256
	cases := []struct {
		digits   string
		expected []string
	}{{"56", []string{"jm", "jn", "jo", "km", "kn", "ko", "lm", "ln", "lo"}}, {"7", []string{"p", "q", "r", "s"}},
		{"", []string{}}, {"2", []string{"a", "b", "c"}}, {"29", lcExpand("29")}, {"99", lcExpand("99")},
		{"234", lcExpand("234")}, {"7979", lcExpand("7979")}}
	for _, c := range cases {
		got := append([]string(nil), letterCombinations(c.digits)...)
		sort.Strings(got)
		if !sameStrings(got, c.expected) {
			fmt.Printf("%q expected %v got %v\n", c.digits, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
