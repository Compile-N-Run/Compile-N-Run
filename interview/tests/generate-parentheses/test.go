package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
)

func validParens(s string) bool {
	depth := 0
	for _, ch := range s {
		if ch == '(' {
			depth++
		} else {
			depth--
		}
		if depth < 0 {
			return false
		}
	}
	return depth == 0
}

func main() {
	exact := map[int][]string{1: {"()"}, 2: {"(())", "()()"}, 3: {"((()))", "(()())", "(())()", "()(())", "()()()"}}
	catalan := []int{1, 1, 2, 5, 14, 42, 132, 429, 1430}
	failed := false
	fail := func(n int, what string, got interface{}) {
		fmt.Println("n =", n, what, "got", got)
		failed = true
	}
	for n := 1; n <= 8; n++ {
		got := append([]string(nil), generateParenthesis(n)...)
		sort.Strings(got)
		if want, ok := exact[n]; ok && !reflect.DeepEqual(got, want) {
			fail(n, "wrong list", got)
		}
		if len(got) != catalan[n] {
			fail(n, "wrong count", len(got))
		}
		seen := map[string]bool{}
		for _, s := range got {
			if seen[s] || len(s) != 2*n || !validParens(s) {
				fail(n, "duplicate or invalid string", s)
			}
			seen[s] = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
