package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
	"strings"
)

func main() {
	cases := []struct {
		s        string
		expected []string
	}{
		{"19216811", []string{"1.92.168.11", "19.2.168.11", "19.21.68.11", "19.216.8.11", "19.216.81.1",
			"192.1.68.11", "192.16.8.11", "192.16.81.1", "192.168.1.1"}},
		{"1020304", []string{"10.20.30.4", "10.203.0.4", "102.0.30.4"}},
		{"0000", []string{"0.0.0.0"}},
		{"00000", []string{}}, // a part would need a leading zero
		{"10000", []string{"10.0.0.0"}},
		{"1111", []string{"1.1.1.1"}},
		{"123", []string{}},           // too short
		{"1234567890123", []string{}}, // too long
		{"255255255255", []string{"255.255.255.255"}},
		{"256256256256", []string{}},
		{"99999999", []string{"99.99.99.99"}},
		{"11011", []string{"1.1.0.11", "1.10.1.1", "11.0.1.1"}},
		{"2552550", []string{"2.55.25.50", "2.55.255.0", "25.5.25.50", "25.5.255.0", "25.52.5.50", "25.52.55.0",
			"255.2.5.50", "255.2.55.0", "255.25.5.0"}},
		{"172160254", []string{"1.72.160.254", "17.2.160.254", "17.21.60.254", "17.216.0.254", "172.1.60.254",
			"172.16.0.254", "172.160.2.54", "172.160.25.4"}},
		{strings.Repeat("1", 20), []string{}}, // the longest allowed input: pruning must not explore it digit by digit
	}
	failed := false
	for _, c := range cases {
		got := restoreIpAddresses(c.s)
		if got == nil {
			got = []string{}
		}
		sort.Strings(got)
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println(c.s, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
