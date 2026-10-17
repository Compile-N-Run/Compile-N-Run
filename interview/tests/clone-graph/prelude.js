// LeetCode's Node for this problem (named _Node on LeetCode): a graph node with a value and a list of neighbours.
function Node(val, neighbors) {
  this.val = val === undefined ? 0 : val;
  this.neighbors = neighbors === undefined ? [] : neighbors;
}
