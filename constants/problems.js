export const PROBLEMS = [
  {
    id: "two-sum",
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 6, we return [0, 1].",
      },
      {
        input: "nums = [-1,-2,-3,-4,-5], target = -8",
        output: "[2,4]",
        explanation:
          "Because nums[2] + nums[4] == -3 + (-5) == -8, we return [2, 4].",
      },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
    ],
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    starterCode: {
      javascript: "function twoSum(nums, target) {\n    // Your code here\n}",
      python: "def two_sum(nums, target):\n    # Your code here\n    pass",
      java: "public int[] twoSum(int[] nums, int target) {\n    // Your code here\n}",
      cpp: "vector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n}",
    },
  },
  {
    id: "add-two-numbers",
    title: "Add Two Numbers",
    description:
      "You are given two non-empty linked lists representing two non-negative integers. Add the two numbers and return the sum as a linked list.",
    examples: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        explanation: "342 + 465 = 807.",
      },
      {
        input: "l1 = [0], l2 = [0]",
        output: "[0]",
        explanation: "0 + 0 = 0.",
      },
      {
        input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]",
        output: "[8,9,9,9,0,0,0,1]",
        explanation: "9999999 + 9999 = 10009998.",
      },
      {
        input: "l1 = [2,4], l2 = [5,6,4]",
        output: "[7,0,5]",
        explanation: "42 + 465 = 507.",
      },
    ],
    constraints: [
      "The number of nodes in each linked list is in the range [1, 100]",
    ],
    difficulty: "Novice",
    tags: ["Linked List", "Math", "Recursion"],
    starterCode: {
      javascript: "function addTwoNumbers(l1, l2) {\n    // Your code here\n}",
      python: "def add_two_numbers(l1, l2):\n    # Your code here\n    pass",
      java: "public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n    // Your code here\n}",
      cpp: "ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n    // Your code here\n}",
    },
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: "3",
        explanation: 'The answer is "wke", with the length of 3.',
      },
      {
        input: 's = ""',
        output: "0",
        explanation: "Empty string has no characters.",
      },
      {
        input: 's = "abcdef"',
        output: "6",
        explanation: "The entire string has no repeating characters.",
      },
      {
        input: 's = "tmmzuxt"',
        output: "5",
        explanation: 'The answer is "mzuxt", with the length of 5.',
      },
    ],
    constraints: ["0 ≤ s.length ≤ 5 * 10⁴"],
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"],
    starterCode: {
      javascript:
        "function lengthOfLongestSubstring(s) {\n    // Your code here\n}",
      python:
        "def length_of_longest_substring(s):\n    # Your code here\n    pass",
      java: "public int lengthOfLongestSubstring(String s) {\n    // Your code here\n}",
      cpp: "int lengthOfLongestSubstring(string s) {\n    // Your code here\n}",
    },
  },
  {
    id: "median-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    description:
      "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "merged array = [1,2,3] and median is 2.",
      },
      {
        input: "nums1 = [1,2], nums2 = [3,4]",
        output: "2.50000",
        explanation:
          "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.",
      },
      {
        input: "nums1 = [0,0], nums2 = [0,0]",
        output: "0.00000",
        explanation: "merged array = [0,0,0,0] and median is (0 + 0) / 2 = 0.",
      },
      {
        input: "nums1 = [], nums2 = [1]",
        output: "1.00000",
        explanation: "merged array = [1] and median is 1.",
      },
      {
        input: "nums1 = [2], nums2 = []",
        output: "2.00000",
        explanation: "merged array = [2] and median is 2.",
      },
    ],
    constraints: ["nums1.length == m", "nums2.length == n"],
    difficulty: "Hard",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    starterCode: {
      javascript:
        "function findMedianSortedArrays(nums1, nums2) {\n    // Your code here\n}",
      python:
        "def find_median_sorted_arrays(nums1, nums2):\n    # Your code here\n    pass",
      java: "public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n    // Your code here\n}",
      cpp: "double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n    // Your code here\n}",
    },
  },
  {
    id: "longest-palindrome",
    title: "Longest Palindromic Substring",
    description:
      "Given a string s, return the longest palindromic substring in s.",
    examples: [
      {
        input: 's = "babad"',
        output: '"bab"',
        explanation: '"aba" is also a valid answer.',
      },
      {
        input: 's = "cbbd"',
        output: '"bb"',
        explanation: 'The longest palindromic substring is "bb".',
      },
      {
        input: 's = "a"',
        output: '"a"',
        explanation: "Single character is always a palindrome.",
      },
      {
        input: 's = "ac"',
        output: '"a"',
        explanation: 'Both "a" and "c" are valid answers.',
      },
      {
        input: 's = "racecar"',
        output: '"racecar"',
        explanation: "The entire string is a palindrome.",
      },
      {
        input: 's = "noon"',
        output: '"noon"',
        explanation: "The entire string is an even-length palindrome.",
      },
    ],
    constraints: ["1 ≤ s.length ≤ 1000"],
    difficulty: "Medium",
    tags: ["String", "Dynamic Programming"],
    starterCode: {
      javascript: "function longestPalindrome(s) {\n    // Your code here\n}",
      python: "def longest_palindrome(s):\n    # Your code here\n    pass",
      java: "public String longestPalindrome(String s) {\n    // Your code here\n}",
      cpp: "string longestPalindrome(string s) {\n    // Your code here\n}",
    },
  },
  {
    id: "reverse-integer",
    title: "Reverse Integer",
    description:
      "Given a signed 32-bit integer x, return x with its digits reversed.",
    examples: [
      {
        input: "x = 123",
        output: "321",
      },
      {
        input: "x = -123",
        output: "-321",
      },
      {
        input: "x = 120",
        output: "21",
        explanation: "Note that the leading zero is dropped.",
      },
      {
        input: "x = 0",
        output: "0",
      },
      {
        input: "x = 1534236469",
        output: "0",
        explanation: "The reversed integer 9646324351 overflows, return 0.",
      },
      {
        input: "x = -2147483648",
        output: "0",
        explanation: "The reversed integer would overflow, return 0.",
      },
    ],
    constraints: ["-2³¹ ≤ x ≤ 2³¹ - 1"],
    difficulty: "Medium",
    tags: ["Math"],
    starterCode: {
      javascript: "function reverse(x) {\n    // Your code here\n}",
      python: "def reverse(x):\n    # Your code here\n    pass",
      java: "public int reverse(int x) {\n    // Your code here\n}",
      cpp: "int reverse(int x) {\n    // Your code here\n}",
    },
  },
  {
    id: "string-to-integer",
    title: "String to Integer (atoi)",
    description:
      "Implement the myAtoi(string s) function, which converts a string to a 32-bit signed integer.",
    examples: [
      {
        input: 's = "42"',
        output: "42",
        explanation:
          "The underlined characters are what is read in and the caret is the current reader position.",
      },
      {
        input: 's = "   -42"',
        output: "-42",
        explanation:
          "Step 1: Whitespace is ignored. Step 2: '-' is read, so the result should be negative. Step 3: '42' is read in.",
      },
      {
        input: 's = "4193 with words"',
        output: "4193",
        explanation:
          "Step 1: '4193' is read in and stops when the next character is not a digit.",
      },
      {
        input: 's = "words and 987"',
        output: "0",
        explanation:
          "Step 1: Reading stops immediately as there is no valid integer.",
      },
      {
        input: 's = "-91283472332"',
        output: "-2147483648",
        explanation:
          "Step 1: '-91283472332' is read in. Step 2: The number is clamped to [-2³¹, 2³¹ - 1].",
      },
      {
        input: 's = ""',
        output: "0",
        explanation: "Empty string returns 0.",
      },
      {
        input: 's = "+1"',
        output: "1",
        explanation: "Plus sign is valid.",
      },
    ],
    constraints: ["0 ≤ s.length ≤ 200"],
    difficulty: "Medium",
    tags: ["String"],
    starterCode: {
      javascript: "function myAtoi(s) {\n    // Your code here\n}",
      python: "def my_atoi(s):\n    # Your code here\n    pass",
      java: "public int myAtoi(String s) {\n    // Your code here\n}",
      cpp: "int myAtoi(string s) {\n    // Your code here\n}",
    },
  },
  {
    id: "palindrome-number",
    title: "Palindrome Number",
    description: "Given an integer x, return true if x is palindrome integer.",
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation:
          "121 reads as 121 from left to right and from right to left.",
      },
      {
        input: "x = -121",
        output: "false",
        explanation:
          "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.",
      },
      {
        input: "x = 10",
        output: "false",
        explanation:
          "Reads 01 from right to left. Therefore it is not a palindrome.",
      },
      {
        input: "x = 0",
        output: "true",
        explanation: "0 is a palindrome.",
      },
      {
        input: "x = 1221",
        output: "true",
        explanation: "1221 reads the same forwards and backwards.",
      },
      {
        input: "x = 12321",
        output: "true",
        explanation: "12321 is an odd-length palindrome.",
      },
    ],
    constraints: ["-2³¹ ≤ x ≤ 2³¹ - 1"],
    difficulty: "Easy",
    tags: ["Math"],
    starterCode: {
      javascript: "function isPalindrome(x) {\n    // Your code here\n}",
      python: "def is_palindrome(x):\n    # Your code here\n    pass",
      java: "public boolean isPalindrome(int x) {\n    // Your code here\n}",
      cpp: "bool isPalindrome(int x) {\n    // Your code here\n}",
    },
  },
  {
    id: "container-water",
    title: "Container With Most Water",
    description:
      "Given n non-negative integers representing an elevation map, find two lines that together with the x-axis forms a container that holds the most water.",
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation:
          "The above vertical lines represent the elevation map [1,8,6,2,5,4,8,3,7]. The max area is between index 1 and 8 (height 8 and 7), area = min(8,7) * (8-1) = 7 * 7 = 49.",
      },
      {
        input: "height = [1,1]",
        output: "1",
        explanation: "The area between the two lines is min(1,1) * (1-0) = 1.",
      },
      {
        input: "height = [4,3,2,1,4]",
        output: "16",
        explanation:
          "The max area is between index 0 and 4 (heights 4 and 4), area = min(4,4) * (4-0) = 4 * 4 = 16.",
      },
      {
        input: "height = [1,2,1]",
        output: "2",
        explanation:
          "The max area is between index 0 and 2 (heights 1 and 1), area = min(1,1) * (2-0) = 1 * 2 = 2.",
      },
      {
        input: "height = [2,1]",
        output: "1",
        explanation: "The area between the two lines is min(2,1) * (1-0) = 1.",
      },
    ],
    constraints: ["n >= 2"],
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Greedy"],
    starterCode: {
      javascript: "function maxArea(height) {\n    // Your code here\n}",
      python: "def max_area(height):\n    # Your code here\n    pass",
      java: "public int maxArea(int[] height) {\n    // Your code here\n}",
      cpp: "int maxArea(vector<int>& height) {\n    // Your code here\n}",
    },
  },
  {
    id: "roman-to-integer",
    title: "Roman to Integer",
    description: "Given a roman numeral, convert it to an integer.",
    examples: [
      {
        input: 's = "III"',
        output: "3",
        explanation: "III = 3.",
      },
      {
        input: 's = "LVIII"',
        output: "58",
        explanation: "L = 50, V = 5, III = 3, so 50 + 5 + 3 = 58.",
      },
      {
        input: 's = "IV"',
        output: "4",
        explanation:
          "IV represents the subtraction case where I before V means 4.",
      },
      {
        input: 's = "IX"',
        output: "9",
        explanation:
          "IX represents the subtraction case where I before X means 9.",
      },
      {
        input: 's = "MCMXC"',
        output: "1990",
        explanation: "M = 1000, CM = 900, XC = 90, so 1000 + 900 + 90 = 1990.",
      },
      {
        input: 's = "MMCDXLIV"',
        output: "2444",
        explanation:
          "MM = 2000, CD = 400, XL = 40, IV = 4, so 2000 + 400 + 40 + 4 = 2444.",
      },
      {
        input: 's = "MCDLXXVI"',
        output: "1476",
        explanation:
          "M = 1000, CD = 400, L = 50, XX = 20, V = 5, I = 1, so 1000 + 400 + 50 + 20 + 5 + 1 = 1476.",
      },
    ],
    constraints: ["1 ≤ s.length ≤ 15"],
    difficulty: "Easy",
    tags: ["Hash Table", "Math", "String"],
    starterCode: {
      javascript: "function romanToInt(s) {\n    // Your code here\n}",
      python: "def roman_to_int(s):\n    # Your code here\n    pass",
      java: "public int romanToInt(String s) {\n    // Your code here\n}",
      cpp: "int romanToInt(string s) {\n    // Your code here\n}",
    },
  },
];
