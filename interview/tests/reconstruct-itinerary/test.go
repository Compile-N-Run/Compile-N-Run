package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	cases := []struct {
		tickets  [][]string
		expected []string
	}{
		{[][]string{{"JFK", "LHR"}, {"LHR", "CDG"}, {"CDG", "JFK"}, {"JFK", "AMS"}}, []string{"JFK", "LHR", "CDG", "JFK", "AMS"}},
		{[][]string{{"JFK", "KUL"}, {"JFK", "NRT"}, {"NRT", "JFK"}}, []string{"JFK", "NRT", "JFK", "KUL"}},
		{[][]string{{"JFK", "NRT"}, {"NRT", "JFK"}, {"JFK", "NRT"}}, []string{"JFK", "NRT", "JFK", "NRT"}},
		{[][]string{{"JFK", "ZRH"}}, []string{"JFK", "ZRH"}},
		{[][]string{{"JFK", "SEA"}, {"SEA", "JFK"}}, []string{"JFK", "SEA", "JFK"}},
		{[][]string{{"JFK", "AAA"}, {"AAA", "BBB"}, {"BBB", "AAA"}, {"AAA", "CCC"}}, []string{"JFK", "AAA", "BBB", "AAA", "CCC"}},
		{[][]string{{"SFO", "JFK"}, {"JFK", "SFO"}, {"JFK", "ATL"}, {"ATL", "SFO"}, {"SFO", "ATL"}},
			[]string{"JFK", "ATL", "SFO", "JFK", "SFO", "ATL"}},
		{[][]string{{"JFK", "BBB"}, {"BBB", "CCC"}, {"CCC", "BBB"}, {"BBB", "AAA"}, {"AAA", "JFK"}, {"JFK", "DDD"}},
			[]string{"JFK", "BBB", "CCC", "BBB", "AAA", "JFK", "DDD"}},
	}
	// A 300-ticket path given in scrambled order, and 150 out-and-back trips from JFK.
	codes := []string{"JFK"}
	for i := 0; i < 300; i++ {
		codes = append(codes, string(rune('A'+i/26))+string(rune('A'+i%26))+"X")
	}
	var path, star [][]string
	starWant := []string{"JFK"}
	for k := 0; k < 300; k++ {
		path = append(path, []string{codes[(k*7)%300], codes[(k*7)%300+1]})
	}
	for i := 0; i < 150; i++ {
		star = append(star, []string{codes[1+i], "JFK"}, []string{"JFK", codes[1+i]})
		starWant = append(starWant, codes[1+i], "JFK")
	}
	cases = append(cases, struct {
		tickets  [][]string
		expected []string
	}{path, codes}, struct {
		tickets  [][]string
		expected []string
	}{star, starWant})
	failed := false
	for n, c := range cases {
		tickets := make([][]string, len(c.tickets))
		for i, t := range c.tickets {
			tickets[i] = []string{t[0], t[1]}
		}
		got := findItinerary(tickets)
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println("case", n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
