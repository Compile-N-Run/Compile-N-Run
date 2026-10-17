package main

// LeetCode's NestedInteger for this problem: either one integer or a list of NestedIntegers.
type NestedInteger struct {
	isInt bool
	value int
	list  []*NestedInteger
}

func (this NestedInteger) IsInteger() bool { return this.isInt }

func (this NestedInteger) GetInteger() int { return this.value }

func (n *NestedInteger) SetInteger(value int) {
	n.isInt, n.value, n.list = true, value, nil
}

func (this *NestedInteger) Add(elem NestedInteger) {
	this.isInt = false
	this.list = append(this.list, &elem)
}

func (this NestedInteger) GetList() []*NestedInteger { return this.list }
