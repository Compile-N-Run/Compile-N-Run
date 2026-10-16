package main

import (
	"fmt"
	"os"
)

// validOrder is true when order lists every letter of words exactly once and respects every adjacent-pair constraint.
func validOrder(words []string, order string) bool {
	var letters, seen [26]bool
	for _, w := range words {
		for i := 0; i < len(w); i++ {
			letters[w[i]-'a'] = true
		}
	}
	var pos [26]int
	for i := 0; i < len(order); i++ {
		c := order[i] - 'a'
		if seen[c] {
			return false
		}
		seen[c] = true
		pos[c] = i
	}
	if seen != letters {
		return false
	}
	for i := 0; i+1 < len(words); i++ {
		w1, w2 := words[i], words[i+1]
		k := 0
		for k < len(w1) && k < len(w2) && w1[k] == w2[k] {
			k++
		}
		if k < len(w1) && k < len(w2) {
			if pos[w1[k]-'a'] >= pos[w2[k]-'a'] {
				return false
			}
		} else if len(w1) > len(w2) {
			return false
		}
	}
	return true
}

func main() {
	// Any valid order is accepted; an unsolvable list must give "".
	perm := "qwertyuiopasdfghjklzxcvbnm"
	pairs := []string{}
	for i := 0; i < len(perm); i++ {
		for j := 0; j < len(perm); j++ {
			pairs = append(pairs, string([]byte{perm[i], perm[j]}))
		}
	}
	cases := []struct {
		words    []string
		solvable bool
	}{
		{[]string{"ba", "bc", "ac", "cab"}, true},
		{[]string{"zy", "zx"}, true},
		{[]string{"ab", "abc"}, true},
		{[]string{"abc", "ab"}, false},
		{[]string{"q", "w", "q"}, false},
		{[]string{"wrt", "wrf", "er", "ett", "rftt"}, true},
		{[]string{"z", "z"}, true},
		{[]string{"a"}, true},
		{[]string{"abcxyz"}, true},
		{[]string{"ac", "ab", "zc", "zb"}, true},
		{[]string{"ab", "ba", "ab"}, false},
		{[]string{"abc", "abd", "ab"}, false},
		{[]string{"z", "y", "x", "w"}, true},
		{pairs, true}, // 676 words that pin down every letter
	}
	failed := false
	for n, c := range cases {
		got := alienOrder(append([]string(nil), c.words...))
		if c.solvable && !validOrder(c.words, got) {
			fmt.Printf("case %d: %q is not a valid order\n", n, got)
			failed = true
		} else if !c.solvable && got != "" {
			fmt.Printf("case %d: expected \"\", got %q\n", n, got)
			failed = true
		}
	}
	if got := alienOrder(append([]string(nil), pairs...)); got != perm {
		fmt.Printf("full alphabet: expected %q, got %q\n", perm, got)
		failed = true
	}
	if failed {
		os.Exit(1)
	}
}
