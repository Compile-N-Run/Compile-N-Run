package main

import (
	"fmt"
	"os"
)

func main() {
	big := [][]int{}
	for i := 9999; i >= 0; i-- {
		big = append(big, []int{i, i + 100}) // each moment is covered by 100 meetings
	}
	cases := []struct {
		intervals [][]int
		expected  int
	}{{[][]int{{1, 5}, {2, 6}, {8, 9}}, 2}, {[][]int{{0, 4}, {4, 7}}, 1}, {[][]int{{1, 10}, {2, 3}, {4, 5}, {6, 7}}, 2},
		{[][]int{{3, 8}, {3, 8}, {3, 8}}, 3}, {[][]int{{5, 6}}, 1}, {[][]int{{6, 9}, {1, 3}, {2, 5}}, 2},
		{[][]int{{1, 2}, {3, 4}, {5, 6}}, 1}, {[][]int{{0, 1000000}, {1, 2}, {2, 3}, {1, 3}}, 3}, {big, 100}}
	failed := false
	for _, c := range cases {
		if got := minMeetingRooms(c.intervals); got != c.expected {
			fmt.Println("meetings", len(c.intervals), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
