package main

// LeetCode's Node for this problem: a graph node with a value and a list of neighbours.
type Node struct {
	Val       int
	Neighbors []*Node
}
