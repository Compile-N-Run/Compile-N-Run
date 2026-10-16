package main

import (
	"fmt"
	"os"
)

func main() {
	big, bigExpected := "", ""
	for i := 0; i < 500; i++ {
		big += fmt.Sprintf("/d%d/./e%d//..", i, i)
		if i < 499 {
			bigExpected += fmt.Sprintf("/d%d", i)
		}
	}
	big += "/../"
	cases := [][2]string{{"/docs/./drafts//final/", "/docs/drafts/final"}, {"/a/b/../../c", "/c"}, {"/../..", "/"},
		{"/x/.../y/..", "/x/..."}, {"/", "/"}, {"///", "/"}, {"/home/", "/home"}, {"/a/./b/./c/.", "/a/b/c"},
		{"/.hidden/..../_x/", "/.hidden/..../_x"}, {"/a/..", "/"}, {big, bigExpected}}
	failed := false
	for _, c := range cases {
		if got := simplifyPath(c[0]); got != c[1] {
			fmt.Printf("%.40q: expected %.60q, got %.60q\n", c[0], c[1], got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
