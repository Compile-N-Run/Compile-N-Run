package main

import (
	"fmt"
	"os"
)

func main() {
	cases := []struct {
		num      int
		expected string
	}{{68, "LXVIII"}, {944, "CMXLIV"}, {2026, "MMXXVI"}, {3999, "MMMCMXCIX"}, {1, "I"}, {4, "IV"}, {9, "IX"}, {40, "XL"},
		{1994, "MCMXCIV"}, {3888, "MMMDCCCLXXXVIII"}}
	failed := false
	for _, c := range cases {
		if got := intToRoman(c.num); got != c.expected {
			fmt.Println(c.num, "expected", c.expected, "got", got)
			failed = true
		}
	}
	// Larger case: every number in range, against an independent digit-by-digit table.
	th := []string{"", "M", "MM", "MMM"}
	hu := []string{"", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"}
	te := []string{"", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"}
	on := []string{"", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"}
	for n := 1; n < 4000; n++ {
		want := th[n/1000] + hu[n/100%10] + te[n/10%10] + on[n%10]
		if got := intToRoman(n); got != want {
			fmt.Println(n, "expected", want, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
