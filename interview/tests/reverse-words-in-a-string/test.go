package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	cases := [][2]string{{"  hello   big world ", "world big hello"}, {"a", "a"}, {"code  2 run", "run 2 code"},
		{"   spaces  ", "spaces"}, {"x y z", "z y x"}, {"Ab12 cD", "cD Ab12"}, {"same same", "same same"}}
	// Larger case: 2000 words with 1 to 3 spaces between them and spaces at both ends.
	var big strings.Builder
	big.WriteString("  ")
	reversed := []string{}
	for i := 0; i < 2000; i++ {
		big.WriteString(fmt.Sprintf("w%d", i) + strings.Repeat(" ", 1+i%3))
		reversed = append([]string{fmt.Sprintf("w%d", i)}, reversed...)
	}
	cases = append(cases, [2]string{big.String(), strings.Join(reversed, " ")})
	failed := false
	for _, c := range cases {
		if got := reverseWords(c[0]); got != c[1] {
			fmt.Printf("%q expected %q got %q\n", c[0][:min(30, len(c[0]))], c[1], got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
