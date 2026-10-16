// LeetCode's Node for this problem (named _Node on LeetCode): a list node with an extra `random` pointer.
function Node(val, next, random) {
  this.val = val;
  this.next = next === undefined ? null : next;
  this.random = random === undefined ? null : random;
}
