package main

import (
	"fmt"
	"math"
	"os"
)

var failed = false

func expect(got, want interface{}, label string) {
	if got != want {
		fmt.Println(label, "expected", want, "got", got)
		failed = true
	}
}

func main() {
	// 1. The write-up's example.
	s := Constructor()
	expect(s.Insert(4), true, "insert 4")
	expect(s.Insert(4), false, "insert 4 again")
	expect(s.Insert(-2), true, "insert -2")
	r := s.GetRandom()
	expect(r == 4 || r == -2, true, "random of {4,-2}")
	expect(s.Remove(4), true, "remove 4")
	expect(s.Remove(4), false, "remove 4 again")
	expect(s.GetRandom(), -2, "only -2 left")

	// 2. Empty set, single element, re-insert after removal.
	s = Constructor()
	expect(s.Remove(0), false, "remove from empty")
	expect(s.Insert(0), true, "insert 0")
	expect(s.GetRandom(), 0, "single 0")
	expect(s.Remove(0), true, "remove 0")
	expect(s.Insert(0), true, "re-insert 0")

	// 3. 32-bit limits and removing the last array element.
	s = Constructor()
	expect(s.Insert(math.MinInt32), true, "insert min")
	expect(s.Insert(math.MaxInt32), true, "insert max")
	expect(s.Remove(math.MaxInt32), true, "remove max (last slot)")
	expect(s.GetRandom(), math.MinInt32, "only min left")

	// 4. Every member is returned at least once, and nothing else.
	s = Constructor()
	members, seen := map[int]bool{}, map[int]bool{}
	for v := -5; v < 5; v++ {
		members[v] = true
		s.Insert(v)
	}
	for t := 0; t < 2000; t++ {
		r := s.GetRandom()
		expect(members[r], true, fmt.Sprint(r, " is a member"))
		seen[r] = true
	}
	expect(len(seen), len(members), "all members returned")

	// 5. Larger case: insert 0..9999, remove the even numbers.
	s = Constructor()
	for v := 0; v < 10000; v++ {
		expect(s.Insert(v), true, fmt.Sprint("insert ", v))
	}
	for v := 0; v < 10000; v += 2 {
		expect(s.Remove(v), true, fmt.Sprint("remove ", v))
	}
	for v := 0; v < 10000; v += 2 {
		expect(s.Remove(v), false, fmt.Sprint("remove again ", v))
	}
	for t := 0; t < 1000; t++ {
		expect(s.GetRandom()%2, 1, "only odd values left")
	}

	// 6. Random operations compared with a reference set.
	s = Constructor()
	model := map[int]bool{}
	state := 12345
	for step := 0; step < 20000; step++ {
		state = (state*1103515245 + 12345) % 2147483648
		op, v := state%3, (state>>8)%50
		switch {
		case op == 0:
			expect(s.Insert(v), !model[v], fmt.Sprint("insert step ", step))
			model[v] = true
		case op == 1:
			expect(s.Remove(v), model[v], fmt.Sprint("remove step ", step))
			delete(model, v)
		case len(model) > 0:
			expect(model[s.GetRandom()], true, fmt.Sprint("getRandom step ", step))
		}
	}
	if failed {
		os.Exit(1)
	}
}
