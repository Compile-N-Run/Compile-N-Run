package main

import (
	"fmt"
	"os"
	"sort"
	"strings"
)

func sortedLetters(s string) string {
	b := []byte(s)
	sort.Slice(b, func(i, j int) bool { return b[i] < b[j] })
	return string(b)
}

// "ok" when got is a valid rearrangement of s (or "" when none exists); otherwise what went wrong.
func reorganizeVerdict(s, got string) string {
	counts := [26]int{}
	most := 0
	for i := 0; i < len(s); i++ {
		counts[s[i]-'a']++
		if counts[s[i]-'a'] > most {
			most = counts[s[i]-'a']
		}
	}
	possible := most <= (len(s)+1)/2
	if got == "" {
		if possible {
			return "empty, but an arrangement exists"
		}
		return "ok"
	}
	if !possible {
		return "not empty, but no arrangement exists"
	}
	if sortedLetters(got) != sortedLetters(s) {
		return "letters differ from the input"
	}
	for i := 1; i < len(got); i++ {
		if got[i] == got[i-1] {
			return "two equal letters are adjacent"
		}
	}
	return "ok"
}

func main() {
	cases := []string{"aab", "aaab", "vvvlo", "a", "aa", "ab", "aabb", "aaabbc", "aaaabbbccd", "zzzzzzyyyyxxww",
		"abcdefghijklmnopqrstuvwxyz",
		strings.Repeat("a", 250) + strings.Repeat("b", 150) + strings.Repeat("c", 100), // 500 letters, exactly half of them a
		strings.Repeat("a", 251) + strings.Repeat("b", 249)}                            // impossible by one letter
	failed := false
	for _, s := range cases {
		got := reorganizeString(s)
		if verdict := reorganizeVerdict(s, got); verdict != "ok" {
			label := s
			if len(s) > 30 {
				label = fmt.Sprintf("%s... (%d letters)", s[:12], len(s))
			}
			fmt.Printf("%q -> %q: %s\n", label, got, verdict)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
