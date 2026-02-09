export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: string;
  starterCodeJS?: string;
  functionName: string;
  functionNameJS?: string;
  testCases: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inputs: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expected: any;
  }[];
  solution?: string;
  solutionCode?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  tags?: string[];
  hints?: string[];
  category?: string;
}

export const PROBLEMS: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: `def two_sum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
    starterCodeJS: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here
}`,
    functionName: 'two_sum',
    functionNameJS: 'twoSum',
    testCases: [
      { inputs: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { inputs: [[3, 2, 4], 6], expected: [1, 2] },
      { inputs: [[3, 3], 6], expected: [0, 1] }
    ],
    solution: `Use a hash map to store each number's index as you iterate. For each element, check if (target - current) exists in the map. If yes, return both indices. This gives O(n) time instead of the brute-force O(n^2) approach.`,
    solutionCode: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    description: `Given the \`head\` of a singly linked list, reverse the list, and return *the reversed list*.`,
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]'
      },
      {
        input: 'head = [1,2]',
        output: '[2,1]'
      },
      {
        input: 'head = []',
        output: '[]'
      }
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000'
    ],
    starterCode: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

def reverse_list(head):
    """
    :type head: ListNode
    :rtype: ListNode
    """
    pass`,
    starterCodeJS: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
    // Write your solution here
}`,
    functionName: 'reverse_list',
    functionNameJS: 'reverseList',
    testCases: [
      { inputs: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { inputs: [[1, 2]], expected: [2, 1] },
      { inputs: [[]], expected: [] }
    ],
    solution: `Use an iterative approach with three pointers: prev, current, and next. For each node, save the next pointer, reverse the current node's pointer to prev, then advance prev and current. This reverses the list in a single pass.`,
    solutionCode: `def reverse_list(head):
    prev = None
    current = head
    while current:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    return prev`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache',
    difficulty: 'Medium',
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:

*   \`LRUCache(int capacity)\` Initialize the LRU cache with positive size \`capacity\`.
*   \`int get(int key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
*   \`void put(int key, int value)\` Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, **evict** the least recently used key.

The functions \`get\` and \`put\` must each run in \`O(1)\` average time complexity.`,
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1]]',
        output: '[null, null, null, 1, null, -1, null, -1]',
        explanation: `LRUCache lRUCache = new LRUCache(2);
lRUCache.put(1, 1); // cache is {1=1}
lRUCache.put(2, 2); // cache is {1=1, 2=2}
lRUCache.get(1);    // return 1
lRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}
lRUCache.get(2);    // returns -1 (not found)
lRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {4=4, 3=3}
lRUCache.get(1);    // return -1 (not found)`
      }
    ],
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.'
    ],
    starterCode: `class LRUCache:

    def __init__(self, capacity: int):
        pass

    def get(self, key: int) -> int:
        pass

    def put(self, key: int, value: int) -> None:
        pass


# Your LRUCache object will be instantiated and called as such:
# obj = LRUCache(capacity)
# param_1 = obj.get(key)
# obj.put(key,value)`,
    starterCodeJS: `/**
 * @param {number} capacity
 */
class LRUCache {
    constructor(capacity) {
        // Write your solution here
    }

    /**
     * @param {number} key
     * @return {number}
     */
    get(key) {

    }

    /**
     * @param {number} key
     * @param {number} value
     * @return {void}
     */
    put(key, value) {

    }
}

// Your LRUCache object will be instantiated and called as such:
// const obj = new LRUCache(capacity);
// const param1 = obj.get(key);
// obj.put(key, value);`,
    functionName: 'LRUCache',
    functionNameJS: 'LRUCache',
    testCases: [
      { inputs: [2, [["put", 1, 1], ["put", 2, 2], ["get", 1], ["put", 3, 3], ["get", 2]]], expected: [null, null, 1, null, -1] }
    ],
    solution: `Combine a hash map with a doubly-linked list. The hash map provides O(1) key lookup, and the doubly-linked list maintains access order so the LRU item is always at the tail. On get(), move the node to the head. On put(), add to the head and evict the tail if over capacity. Python's OrderedDict simplifies this.`,
    solutionCode: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cache = OrderedDict()
        self.capacity = capacity

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
    timeComplexity: 'O(1) per operation',
    spaceComplexity: 'O(capacity)',
  }
];
