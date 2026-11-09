const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('../config/db');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');

const coursesData = [
  {
    code: 'AMCS',
    title: 'Applied Mathematics',
    slug: 'applied-mathematics',
    durationHours: 0,
    lessonCount: 0,
    image: '/images/AMCS.png',
    description: 'Foundational discrete mathematics, linear algebra, graph theory, and probability essential for computer science algorithms and analysis.',
    order: 1,
    modules: []
  },
  {
    code: 'DS',
    title: 'Data Structures',
    slug: 'data-structures',
    durationHours: 3.0,
    lessonCount: 18,
    image: '/images/DS.png',
    description: 'Master core computational structures including Arrays, Strings, Linked Lists, Stacks, Queues, Binary Trees, Heaps, Hash Tables, and Graphs with Big-O time complexity analysis.',
    order: 2,
    modules: [
      {
        moduleNumber: 1,
        title: 'Introduction to Data Structures',
        slug: 'introduction-to-data-structures',
        summary: 'Understand what data structures are, primitive vs non-primitive classifications, linear vs non-linear organizations, and algorithm analysis with Big-O notation.',
        estimatedMinutes: 38,
        keyConcepts: ['Data Structures Definition', 'Primitive vs Non-primitive', 'Linear vs Non-linear', 'Algorithms', 'Big-O Notation', 'Time & Space Complexity'],
        topics: [
          {
            topicNumber: 1,
            title: 'What Are Data Structures?',
            estimatedMinutes: 8,
            pdfUrl: '/materials/01_What_Are_Data_Structures.pdf'
          },
          {
            topicNumber: 2,
            title: 'Types of Data Structures',
            estimatedMinutes: 8,
            pdfUrl: '/materials/02_Types_of_Data_Structures.pdf'
          },
          {
            topicNumber: 3,
            title: 'Linear vs. Non-linear Structures',
            estimatedMinutes: 8,
            pdfUrl: '/materials/03_Linear_vs_Non_Linear.pdf'
          },
          {
            topicNumber: 4,
            title: 'Algorithms and Big-O Notation',
            estimatedMinutes: 14,
            pdfUrl: '/materials/04_Algorithms_and_Big_O.pdf'
          }
        ],
        content: `
# Module 1: Introduction to Data Structures
Total: 38 minutes

Data structures are systematic ways of organizing, storing, and manipulating data efficiently within a computer system. The choice of appropriate data structure directly influences algorithm performance and resource consumption.

---

## 1. What Are Data Structures? (8 min)
A data structure is a specialized format for organizing, processing, retrieving, and storing data.
- **Data Item:** A single unit of values (e.g., student roll number, name).
- **Group Items:** Data items divided into sub-items (e.g., date broken down into day, month, year).
- **Elementary Items:** Indivisible items (e.g., integer ID).
- **Need for Data Structures:** High processing speed, data search optimization, managing multiple concurrent user requests, and minimizing memory overhead.

---

## 2. Types of Data Structures (8 min)
Data structures are broadly categorized into two major divisions:
1. **Primitive Data Structures:**
   - Basic data types supported directly by programming languages (e.g., \`int\`, \`float\`, \`char\`, \`boolean\`, pointers).
   - Hold single raw values and are operated on directly by machine instructions.
2. **Non-Primitive Data Structures:**
   - Sophisticated structures derived from primitive types to manage groups of homogeneous or heterogeneous data.
   - Divided into Linear (Arrays, Linked Lists, Stacks, Queues) and Non-Linear (Trees, Graphs, Hash Tables).

---

## 3. Linear vs. Non-linear Structures (8 min)
- **Linear Data Structures:**
  - Elements form a sequential sequence; each element has a unique predecessor and successor (except first and last).
  - Single-level traversal in one pass.
  - *Examples:* Arrays, Linked Lists, Stacks, Queues.
  - Memory: Often contiguous or linked sequentially.
- **Non-Linear Data Structures:**
  - Elements do not form a sequence; an element may connect to multiple elements.
  - Hierarchical (parent-child) or interconnected relationships.
  - Multi-level traversal (requires recursion, BFS, or DFS).
  - *Examples:* Trees, Graphs, Multi-dimensional structures.

---

## 4. Algorithms and Big-O Notation (14 min)
An algorithm is a step-by-step finite sequence of computational instructions to solve a specific problem.

### Asymptotic Notations:
- **Big-O ($O$):** Upper bound on execution time (Worst-case analysis).
- **Big-Omega ($\\Omega$):** Lower bound on execution time (Best-case analysis).
- **Big-Theta ($\\Theta$):** Tight bound (Average-case analysis).

### Common Time Complexities (Fastest to Slowest):
1. $O(1)$ — Constant Time (array index lookup).
2. $O(\\log n)$ — Logarithmic Time (Binary Search).
3. $O(n)$ — Linear Time (Linear Search, single loop).
4. $O(n \\log n)$ — Linearithmic Time (Merge Sort, Quick Sort).
5. $O(n^2)$ — Quadratic Time (Nested loops, Bubble Sort).
6. $O(2^n)$ — Exponential Time (Recursive Fibonacci).
        `,
        quiz: {
          title: 'Introduction to Data Structures Assessment',
          questions: [
            {
              questionText: 'What is the primary definition of a Data Structure?',
              options: [
                'A computer program that compiles high-level code',
                'A specialized format for organizing, processing, and storing data efficiently',
                'A physical chip on the motherboard that holds RAM',
                'A networking protocol for transferring files over the internet'
              ],
              correctOptionIndex: 1,
              explanation: 'A data structure is a specialized format for organizing, processing, retrieving, and storing data in computer memory.'
            },
            {
              questionText: 'Which of the following is categorized as a Primitive Data Structure?',
              options: ['Linked List', 'Stack', 'Integer (int)', 'Binary Search Tree'],
              correctOptionIndex: 2,
              explanation: 'Integer, Float, Char, and Boolean are primitive data types provided directly by programming languages.'
            },
            {
              questionText: 'In a linear data structure, how are elements arranged?',
              options: [
                'Hierarchically with parent and child relationships',
                'Arbitrarily with interconnected graph vertices',
                'Sequentially where each element has a unique predecessor and successor',
                'Randomly distributed across multiple memory nodes'
              ],
              correctOptionIndex: 2,
              explanation: 'Linear data structures organize elements in a sequential linear sequence with direct predecessors and successors.'
            },
            {
              questionText: 'Which of the following is an example of a non-linear data structure?',
              options: ['Array', 'Queue', 'Tree', 'Stack'],
              correctOptionIndex: 2,
              explanation: 'Trees and Graphs are non-linear data structures because elements can connect to multiple other elements.'
            },
            {
              questionText: 'What does Big-O notation specifically describe in algorithm analysis?',
              options: [
                'The minimum exact number of CPU cycles consumed',
                'The upper bound (worst-case) asymptotic growth rate of an algorithm',
                'The lower bound (best-case) execution time',
                'The physical memory hardware capacity of a system'
              ],
              correctOptionIndex: 1,
              explanation: 'Big-O notation describes the upper bound or worst-case growth rate of an algorithm as input size increases.'
            },
            {
              questionText: 'Which time complexity represents constant execution time regardless of input size?',
              options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
              correctOptionIndex: 1,
              explanation: 'O(1) represents constant time, meaning execution completes in fixed time irrespective of n.'
            },
            {
              questionText: 'What is the time complexity of searching an element using Binary Search in a sorted array?',
              options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
              correctOptionIndex: 2,
              explanation: 'Binary Search halves the search space at each iteration, resulting in O(log n) logarithmic complexity.'
            },
            {
              questionText: 'Which of the following data structures operates on dynamic node references rather than contiguous memory blocks?',
              options: ['Static Array', 'Linked List', 'Matrix', 'Look-up Table'],
              correctOptionIndex: 1,
              explanation: 'Linked lists use dynamic node allocations connected by pointers/references rather than contiguous blocks.'
            },
            {
              questionText: 'If an algorithm contains two nested loops each iterating n times, what is its overall time complexity?',
              options: ['O(2n)', 'O(n)', 'O(n^2)', 'O(log n)'],
              correctOptionIndex: 2,
              explanation: 'Two nested loops executing n times each result in n * n = O(n^2) quadratic time complexity.'
            },
            {
              questionText: 'Why is space complexity an important metric alongside time complexity?',
              options: [
                'It measures how many lines of source code were written',
                'It quantifies the amount of working memory an algorithm needs to execute',
                'It calculates the network bandwidth needed to download the file',
                'It checks the clock frequency of the processor'
              ],
              correctOptionIndex: 1,
              explanation: 'Space complexity quantifies the total memory space required by an algorithm with respect to input size.'
            }
          ]
        }
      },
      {
        moduleNumber: 2,
        title: 'Arrays and Strings',
        slug: 'arrays-and-strings',
        summary: 'Master memory layouts of 1D and 2D arrays, fundamental traversal and manipulation algorithms, basic searching, sorting, and core string operations.',
        estimatedMinutes: 32,
        keyConcepts: ['1D Arrays', '2D Matrices', 'Row-Major Order', 'Column-Major Order', 'Linear Search', 'Binary Search', 'String Immutability'],
        topics: [
          {
            topicNumber: 5,
            title: 'Array Operations and Traversal',
            estimatedMinutes: 12,
            pdfUrl: '/materials/05_Array_Operations_and_Traversal.pdf'
          },
          {
            topicNumber: 6,
            title: 'Searching and Sorting Basics',
            estimatedMinutes: 12,
            pdfUrl: '/materials/06_Searching_and_Sorting_Basics.pdf'
          },
          {
            topicNumber: 7,
            title: 'One-dimensional and Two-dimensional Arrays',
            estimatedMinutes: 10,
            pdfUrl: '/materials/07_1D_and_2D_Arrays.pdf'
          },
          {
            topicNumber: 8,
            title: 'String Operations',
            estimatedMinutes: 10,
            pdfUrl: '/materials/08_String_Operations.pdf'
          }
        ],
        content: `
# Module 2: Arrays and Strings
Total: 32 minutes

Arrays and strings form the foundation of contiguous memory storage. Understanding their indexing arithmetic and memory layouts is critical for low-level performance optimization.

---

## 5. Array Operations and Traversal (12 min)
An array is a collection of elements of the same data type placed in contiguous memory locations.
- **Base Address:** The memory address of the first element $A[0]$.
- **Address Calculation Formula (1D Array):**
  $$\\text{Address}(A[i]) = \\text{Base Address} + (i - \\text{lower bound}) \\times \\text{element size}$$
- **Core Operations:**
  - *Traversal:* Visiting each element exactly once ($O(n)$).
  - *Insertion:* Inserting at index $i$ requires shifting elements right ($O(n)$ worst case, $O(1)$ at end if space exists).
  - *Deletion:* Removing at index $i$ requires shifting elements left ($O(n)$).
  - *Lookup:* Accessing by index $A[i]$ is instantaneous ($O(1)$).

---

## 6. Searching and Sorting Basics (12 min)
- **Linear Search:** Compares key with each element sequentially from index 0 to $n-1$. Best case $O(1)$, worst case $O(n)$. Works on unsorted data.
- **Binary Search:** Requires a sorted array. Divides the search interval in half repeatedly:
  $$\\text{mid} = \\text{low} + \\lfloor(\\text{high} - \\text{low}) / 2\\rfloor$$
  Time Complexity: $O(\\log n)$.
- **Bubble Sort:** Repeatedly steps through the list, compares adjacent elements, and swaps them if out of order. Worst/Average: $O(n^2)$.
- **Insertion Sort:** Builds sorted array one element at a time by inserting into proper position. Best: $O(n)$, Worst: $O(n^2)$.

---

## 7. One-dimensional and Two-dimensional Arrays (10 min)
- **1D Array:** Linear list with single subscript.
- **2D Array (Matrix):** Grid with $R$ rows and $C$ columns.
- **Memory Mapping Representations:**
  - *Row-Major Order (Used in C/C++, Java):* Rows stored consecutively.
    $$\\text{Address}(A[i][j]) = \\text{Base} + (i \\times C + j) \\times W$$
  - *Column-Major Order (Used in Fortran, MATLAB):* Columns stored consecutively.
    $$\\text{Address}(A[i][j]) = \\text{Base} + (j \\times R + i) \\times W$$

---

## 8. String Operations (10 min)
A string is an array of characters, often terminated with a null character (\`\\0\`) in C-style implementations or treated as immutable objects in languages like JavaScript, Python, and Java.
- **Common Operations:** Length computation ($O(n)$ or $O(1)$), Concatenation ($O(m + n)$), Substring extraction ($O(k)$), Pattern matching (Naive $O(m \\times n)$, KMP $O(m + n)$).
        `,
        quiz: {
          title: 'Arrays and Strings Assessment',
          questions: [
            {
              questionText: 'What is the time complexity of accessing an array element via its index A[i]?',
              options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
              correctOptionIndex: 2,
              explanation: 'Because array elements occupy contiguous memory, index arithmetic calculates the exact address in O(1) constant time.'
            },
            {
              questionText: 'In row-major order storage for a 2D array A[R][C], how are elements laid out in memory?',
              options: [
                'Elements of each column are stored consecutively',
                'Elements of each row are stored consecutively in sequence',
                'Elements along diagonals are stored consecutively',
                'Elements are stored in random hashed positions'
              ],
              correctOptionIndex: 1,
              explanation: 'Row-major order stores all elements of row 0, followed by all elements of row 1, and so forth.'
            },
            {
              questionText: 'What prerequisite is strictly required before executing a Binary Search on an array?',
              options: [
                'The array size must be an exact power of 2',
                'The array elements must be sorted in ascending or descending order',
                'The array must only contain positive integers',
                'The array must be dynamically allocated on the heap'
              ],
              correctOptionIndex: 1,
              explanation: 'Binary Search depends on comparing the target with the median element, which requires sorted order.'
            },
            {
              questionText: 'What is the worst-case time complexity of inserting an element at the beginning (index 0) of an array of size n?',
              options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
              correctOptionIndex: 2,
              explanation: 'Inserting at index 0 requires shifting all n existing elements one position to the right, which takes O(n) operations.'
            },
            {
              questionText: 'What is the worst-case time complexity of Bubble Sort?',
              options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'],
              correctOptionIndex: 2,
              explanation: 'Bubble Sort compares adjacent elements in nested passes, yielding O(n^2) worst-case time complexity.'
            },
            {
              questionText: 'In languages where strings are immutable, what happens when a string is modified?',
              options: [
                'The underlying memory characters are changed in-place',
                'A new string object is allocated in memory with the updated content',
                'The operating system throws a memory fault',
                'The compiler deletes the original variable'
              ],
              correctOptionIndex: 1,
              explanation: 'Immutability means the original string cannot be altered; any modification constructs a brand-new string object.'
            },
            {
              questionText: 'In column-major order for a matrix with R rows and C columns, what is the address offset multiplier for column index j?',
              options: ['j * C', 'j * R', 'j + R', 'j * (R + C)'],
              correctOptionIndex: 1,
              explanation: 'In column-major order, each preceding column contains R rows, so column index j skips j * R elements.'
            },
            {
              questionText: 'What does Linear Search do when the searched element is not present in an array of size n?',
              options: [
                'Halves the array and returns immediately',
                'Inspects every element from index 0 to n-1 before reporting not found',
                'Sorts the array automatically',
                'Returns index 0 by default'
              ],
              correctOptionIndex: 1,
              explanation: 'Linear search sequentially examines all n items in the worst case before concluding the element is absent.'
            },
            {
              questionText: 'Which operation on an array is most efficient when size is within allocated capacity?',
              options: [
                'Deletion at index 0',
                'Insertion at index 0',
                'Appending an element at the end of the array',
                'Inserting at the middle index'
              ],
              correctOptionIndex: 2,
              explanation: 'Appending at the end requires no shifting of elements and operates in O(1) constant time.'
            },
            {
              questionText: 'What is the formula for the number of elements in a 2D array declared as A[1..5][1..10]?',
              options: ['15', '50', '25', '100'],
              correctOptionIndex: 1,
              explanation: 'Total elements = (5 - 1 + 1) * (10 - 1 + 1) = 5 * 10 = 50 elements.'
            }
          ]
        }
      },
      {
        moduleNumber: 3,
        title: 'Linked Lists',
        slug: 'linked-lists',
        summary: 'Examine dynamic node allocations, pointer manipulation, singly and doubly linked lists, insertion, deletion at various positions, and traversal techniques.',
        estimatedMinutes: 30,
        keyConcepts: ['Singly Linked List', 'Doubly Linked List', 'Pointers & References', 'Head and Tail', 'Insertion/Deletion', 'Traversal'],
        topics: [
          {
            topicNumber: 9,
            title: 'Singly and Doubly Linked Lists',
            estimatedMinutes: 12,
            pdfUrl: '/materials/09_Singly_and_Doubly_Linked_Lists.pdf'
          },
          {
            topicNumber: 10,
            title: 'Linked List Insertion and Deletion',
            estimatedMinutes: 10,
            pdfUrl: '/materials/10_Linked_List_Insertion_and_Deletion.pdf'
          },
          {
            topicNumber: 11,
            title: 'Linked List Traversal and Searching',
            estimatedMinutes: 8,
            pdfUrl: '/materials/11_Linked_List_Traversal_and_Searching.pdf'
          }
        ],
        content: `
# Module 3: Linked Lists
Total: 30 minutes

A Linked List is a linear dynamic data structure where elements (called nodes) are stored non-contiguously in memory and connected via pointers.

---

## 9. Singly and Doubly Linked Lists (12 min)
- **Node Structure:** Contains a \`data\` field and one or more pointer/reference fields.
- **Singly Linked List (SLL):**
  - Each node contains \`data\` and a \`next\` pointer pointing to the following node.
  - The last node's \`next\` points to \`NULL\`.
  - Traversal is strictly unidirectional (forward only).
- **Doubly Linked List (DLL):**
  - Each node contains \`data\`, \`next\` pointer, and \`prev\` pointer pointing to predecessor.
  - Allows bidirectional traversal (forward and backward).
  - Extra memory overhead: Requires storing two pointers per node.
- **Circular Linked List:**
  - The last node's \`next\` pointer points back to the \`head\` node instead of \`NULL\`.

---

## 10. Linked List Insertion and Deletion (10 min)
Unlike arrays, linked lists do not require shifting elements during insertion or deletion:
- **Insertion at Beginning:**
  - Allocate new node $\\to$ set \`newNode.next = head\` $\\to$ update \`head = newNode\`. Time: $O(1)$.
- **Insertion at End:**
  - Traverse to last node ($O(n)$) $\\to$ set \`lastNode.next = newNode\`. If \`tail\` pointer is maintained: $O(1)$.
- **Deletion at Beginning:**
  - Set \`temp = head\` $\\to$ \`head = head.next\` $\\to$ free \`temp\`. Time: $O(1)$.
- **Deletion by Value:**
  - Search node and track previous node ($O(n)$) $\\to$ \`prev.next = current.next\` $\\to$ free \`current\`.

---

## 11. Linked List Traversal and Searching (8 min)
- **Traversal:** Starting at \`head\`, follow \`current = current.next\` until \`current == NULL\`. Time: $O(n)$.
- **Searching:** Linear comparison along traversal. Best case: $O(1)$ (head), Worst case: $O(n)$ (tail or absent).
- **No Direct Indexing:** Linked lists cannot perform $O(1)$ random access like arrays; reaching index $k$ requires $k$ pointer dereferences.
        `,
        quiz: {
          title: 'Linked Lists Assessment',
          questions: [
            {
              questionText: 'What are the two standard components of a node in a Singly Linked List?',
              options: [
                'Two data values',
                'Data field and a Next pointer',
                'Key and Array of children',
                'Row index and Column index'
              ],
              correctOptionIndex: 1,
              explanation: 'A singly linked list node contains a payload data field and a next pointer to the succeeding node.'
            },
            {
              questionText: 'What is the time complexity of inserting a new node at the head of a linked list?',
              options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
              correctOptionIndex: 1,
              explanation: 'Inserting at head only requires updating the new node next pointer and reassigning head, taking O(1) constant time.'
            },
            {
              questionText: 'What distinctive advantage does a Doubly Linked List have over a Singly Linked List?',
              options: [
                'It uses less memory per node',
                'It allows bidirectional traversal (both forward and backward)',
                'It supports constant-time random access by index',
                'It does not require null termination'
              ],
              correctOptionIndex: 1,
              explanation: 'With both next and prev pointers, a DLL can be traversed in both directions.'
            },
            {
              questionText: 'In a Circular Singly Linked List, where does the last node point to?',
              options: ['NULL', 'The previous node', 'The first (head) node', 'A random memory location'],
              correctOptionIndex: 2,
              explanation: 'In a circular linked list, the final node wraps around to point to the head node.'
            },
            {
              questionText: 'Why can Binary Search NOT be efficiently executed on a standard Singly Linked List in O(log n) time?',
              options: [
                'Linked lists cannot store sorted values',
                'Linked lists do not support O(1) random access to middle elements',
                'Pointers cannot be compared with integers',
                'Linked list size is fixed at compile time'
              ],
              correctOptionIndex: 1,
              explanation: 'Finding the middle of a linked list takes O(n) traversal, eliminating the O(log n) advantage of binary search.'
            },
            {
              questionText: 'What is the space complexity overhead per node in a Doubly Linked List on a 64-bit architecture?',
              options: ['0 extra bytes', '8 bytes (one pointer)', '16 bytes (two pointers: next and prev)', '32 bytes'],
              correctOptionIndex: 2,
              explanation: 'Each 64-bit pointer is 8 bytes; storing both next and prev pointers requires 16 bytes of pointer overhead per node.'
            },
            {
              questionText: 'What condition indicates that a singly linked list is empty?',
              options: ['head.next == NULL', 'head == NULL', 'head.data == 0', 'tail == NULL && head != NULL'],
              correctOptionIndex: 1,
              explanation: 'A linked list is empty when the head pointer points to NULL (or null).'
            },
            {
              questionText: 'What is the time complexity to delete a node given a pointer directly to that node in a Doubly Linked List?',
              options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
              correctOptionIndex: 1,
              explanation: 'Because a DLL node has pointers to both predecessor and successor, node removal takes O(1) constant time.'
            },
            {
              questionText: 'What is a memory leak in manual memory management languages when deleting linked list nodes?',
              options: [
                'Accessing a node that has already been cleared',
                'Failing to deallocate/free memory occupied by unlinked nodes',
                'Allocating nodes with negative pointers',
                'Assigning head to point to tail'
              ],
              correctOptionIndex: 1,
              explanation: 'A memory leak happens when dynamically allocated nodes are removed from list pointers without freeing memory.'
            },
            {
              questionText: 'Which algorithm is used to detect a cycle in a linked list in O(n) time and O(1) memory?',
              options: [
                'Binary Search',
                'Floyd\'s Cycle-Finding Algorithm (Tortoise and Hare)',
                'Dijkstra\'s Shortest Path Algorithm',
                'Quick Sort'
              ],
              correctOptionIndex: 1,
              explanation: 'Floyd\'s Tortoise and Hare algorithm uses two pointers moving at different speeds to detect cycles in O(n) time and O(1) space.'
            }
          ]
        }
      },
      {
        moduleNumber: 4,
        title: 'Stacks and Queues',
        slug: 'stacks-and-queues',
        summary: 'Explore LIFO and FIFO abstract data types, stack push/pop operations, queue enqueue/dequeue operations, and real-world applications in expression evaluation and scheduling.',
        estimatedMinutes: 20,
        keyConcepts: ['LIFO', 'FIFO', 'Push / Pop', 'Enqueue / Dequeue', 'Infix to Postfix', 'Call Stack', 'Circular Queue'],
        topics: [
          {
            topicNumber: 12,
            title: 'Stack and Queue Operations',
            estimatedMinutes: 12,
            pdfUrl: '/materials/12_Stacks_Queues_Operations.pdf'
          },
          {
            topicNumber: 13,
            title: 'Stack and Queue Applications',
            estimatedMinutes: 8,
            pdfUrl: '/materials/13_Stack_Queue_Applications.pdf'
          }
        ],
        content: `
# Module 4: Stacks and Queues
Total: 20 minutes

Stacks and Queues are constrained linear data structures with strictly defined insertion and deletion access points.

---

## 12. Stack and Queue Operations (12 min)
- **Stack (LIFO — Last In, First Out):**
  - Operations occur only at one end: the **Top**.
  - \`push(x)\`: Add item to top ($O(1)$).
  - \`pop()\`: Remove item from top ($O(1)$).
  - \`peek()\` / \`top()\`: View top element without removing ($O(1)$).
  - \`isEmpty()\`: Check if stack is empty ($O(1)$).
  - Underflow (popping empty stack) vs Overflow (pushing full static stack).
- **Queue (FIFO — First In, First Out):**
  - Operations occur at two ends: **Front** and **Rear**.
  - \`enqueue(x)\`: Insert item at Rear ($O(1)$).
  - \`dequeue()\`: Remove item from Front ($O(1)$).
  - **Circular Queue:** Solves the linear queue drawback where deleted front space cannot be reused by wrapping indices modulo size:
    $$\\text{rear} = (\\text{rear} + 1) \\pmod N$$

---

## 13. Stack and Queue Applications (8 min)
- **Stack Applications:**
  - Function Call Stack (Recursion management and return addresses).
  - Expression Evaluation (Infix to Postfix / Prefix conversion using Shunting-Yard).
  - Parentheses balancing and syntax validation in compilers.
  - Undo/Redo operations in text editors.
  - Depth-First Search (DFS) graph traversal.
- **Queue Applications:**
  - CPU process scheduling (Round-Robin).
  - Printer spooling buffers.
  - Breadth-First Search (BFS) graph traversal.
  - Asynchronous message brokers (RabbitMQ, Kafka queues).
        `,
        quiz: {
          title: 'Stacks and Queues Assessment',
          questions: [
            {
              questionText: 'What operational discipline does a Stack data structure follow?',
              options: [
                'FIFO (First In, First Out)',
                'LIFO (Last In, First Out)',
                'Random Access Priority',
                'Hierarchical Ordering'
              ],
              correctOptionIndex: 1,
              explanation: 'A stack operates on LIFO (Last In, First Out) discipline, where the most recently added item is the first removed.'
            },
            {
              questionText: 'What operational discipline does a standard Queue data structure follow?',
              options: [
                'LIFO (Last In, First Out)',
                'FIFO (First In, First Out)',
                'LILO (Last In, Last Out only)',
                'Priority Weighting'
              ],
              correctOptionIndex: 1,
              explanation: 'A queue operates on FIFO (First In, First Out) discipline, where the first inserted item is the first dequeued.'
            },
            {
              questionText: 'What condition occurs when attempting to pop an element from an empty stack?',
              options: ['Stack Overflow', 'Stack Underflow', 'Segmentation Fault', 'Memory Deadlock'],
              correctOptionIndex: 1,
              explanation: 'Attempting to pop or peek from an empty stack is termed Stack Underflow.'
            },
            {
              questionText: 'Which data structure is fundamentally utilized by compilers to manage function calls and local variables?',
              options: ['Queue', 'Call Stack', 'Binary Search Tree', 'Hash Table'],
              correctOptionIndex: 1,
              explanation: 'The call stack tracks active subroutines, parameter passing, and return addresses in LIFO order.'
            },
            {
              questionText: 'How does a Circular Queue resolve the limitation of a simple array-based linear queue?',
              options: [
                'By dynamically allocating memory on each enqueue',
                'By wrapping rear and front pointers using modulo arithmetic to reuse freed front slots',
                'By sorting elements after each dequeue',
                'By doubling array capacity on every operation'
              ],
              correctOptionIndex: 1,
              explanation: 'A circular queue uses modulo arithmetic ((rear + 1) % size) to reuse vacant space left by dequeued elements.'
            },
            {
              questionText: 'Which graph traversal algorithm intrinsically uses a Queue?',
              options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Dijkstra with Array', 'Bellman-Ford'],
              correctOptionIndex: 1,
              explanation: 'BFS explores vertices level-by-level, utilizing a FIFO queue to track visiting order.'
            },
            {
              questionText: 'What is the time complexity of Push and Pop operations in a properly implemented stack?',
              options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'],
              correctOptionIndex: 1,
              explanation: 'Stack operations occur exclusively at the top pointer and complete in O(1) constant time.'
            },
            {
              questionText: 'In evaluating a postfix expression (Reverse Polish Notation), which data structure is employed?',
              options: ['Queue', 'Stack', 'Doubly Linked List', 'Priority Queue'],
              correctOptionIndex: 1,
              explanation: 'Operands are pushed onto a stack; operators pop the top operands, compute the result, and push it back.'
            },
            {
              questionText: 'What is a Deque (Double-Ended Queue)?',
              options: [
                'A queue that only accepts strings',
                'A queue where insertion and deletion are allowed at both ends (front and rear)',
                'A queue with two separate consumer threads',
                'A queue that automatically reverses its items'
              ],
              correctOptionIndex: 1,
              explanation: 'A Deque allows enqueue and dequeue operations at both the front and the rear ends.'
            },
            {
              questionText: 'What is the result of evaluating the postfix expression: "5 3 + 2 *"?',
              options: ['11', '16', '13', '10'],
              correctOptionIndex: 1,
              explanation: '5 + 3 = 8; then 8 * 2 = 16.'
            }
          ]
        }
      },
      {
        moduleNumber: 5,
        title: 'Trees and Graphs',
        slug: 'trees-and-graphs',
        summary: 'Learn hierarchical and networked data structures, binary trees, inorder/preorder/postorder traversals, Binary Search Trees (BST), and graph representations with BFS/DFS.',
        estimatedMinutes: 36,
        keyConcepts: ['Binary Tree', 'BST Property', 'Inorder / Preorder / Postorder', 'Adjacency Matrix / List', 'BFS', 'DFS'],
        topics: [
          {
            topicNumber: 14,
            title: 'Binary Trees and Traversal',
            estimatedMinutes: 12,
            pdfUrl: '/materials/14_Binary_Trees_and_Traversal.pdf'
          },
          {
            topicNumber: 15,
            title: 'Binary Search Trees',
            estimatedMinutes: 10,
            pdfUrl: '/materials/15_Binary_Search_Trees.pdf'
          },
          {
            topicNumber: 16,
            title: 'Graph Representation, BFS and DFS',
            estimatedMinutes: 14,
            pdfUrl: '/materials/16_Graphs_BFS_DFS.pdf'
          }
        ],
        content: `
# Module 5: Trees and Graphs
Total: 36 minutes

Trees and Graphs represent non-linear relationships. Trees model hierarchies (DOM trees, file systems), while Graphs model networks (social connections, routing protocols).

---

## 14. Binary Trees and Traversal (12 min)
- **Binary Tree:** A tree where every node has at most two children: \`left\` and \`right\`.
- **Key Terminology:** Root, Leaf (node with 0 children), Height (longest path from root to leaf), Depth.
- **Tree Traversals (Depth-First):**
  - **Inorder (Left, Root, Right):** Produces elements in non-decreasing order for BSTs.
  - **Preorder (Root, Left, Right):** Useful for cloning/serializing trees.
  - **Postorder (Left, Right, Root):** Useful for deleting trees and evaluating postfix expression trees.
- **Breadth-First Traversal (Level-Order):** Visits nodes level-by-level using a FIFO queue.

---

## 15. Binary Search Trees (BST) (10 min)
- **BST Property:** For every node $X$:
  - All keys in left subtree $< X.\\text{key}$.
  - All keys in right subtree $> X.\\text{key}$.
- **Operations:**
  - *Search:* If $target < root$, recurse left; if $target > root$, recurse right.
  - *Insertion:* Traverse until finding NULL position preserving BST invariant.
  - *Deletion:*
    - Leaf node: Delete directly.
    - One child: Connect parent directly to child.
    - Two children: Replace with Inorder Successor (smallest in right subtree) or Inorder Predecessor.
  - *Time Complexity:* Balanced BST: $O(\\log n)$. Degenerate/Skewed BST: $O(n)$.

---

## 16. Graph Representation, BFS and DFS (14 min)
A Graph $G = (V, E)$ consists of vertices $V$ and edges $E$ (Directed or Undirected, Weighted or Unweighted).
- **Representations:**
  - **Adjacency Matrix:** A 2D array $M[V][V]$ where $M[i][j] = 1$ if edge exists. Space: $O(V^2)$.
  - **Adjacency List:** An array of linked lists/vectors where list $i$ contains neighbors of vertex $i$. Space: $O(V + E)$. Ideal for sparse graphs.
- **Graph Traversal Algorithms:**
  - **Breadth-First Search (BFS):** Explores neighbors level by level using a Queue. Finds shortest path in unweighted graphs. Time: $O(V + E)$.
  - **Depth-First Search (DFS):** Explores as deep as possible along each branch before backtracking using a Stack / Recursion. Time: $O(V + E)$.
        `,
        quiz: {
          title: 'Trees and Graphs Assessment',
          questions: [
            {
              questionText: 'What is the fundamental property of a Binary Search Tree (BST)?',
              options: [
                'Every node must have exactly two children',
                'Left subtree keys < Node key < Right subtree keys',
                'All leaf nodes must be at the identical level',
                'The tree must be complete and filled from left to right'
              ],
              correctOptionIndex: 1,
              explanation: 'In a BST, all keys in the left subtree are smaller than the node, and all keys in the right subtree are greater.'
            },
            {
              questionText: 'Which tree traversal visits the Root node FIRST, before traversing left and right subtrees?',
              options: ['Inorder Traversal', 'Preorder Traversal', 'Postorder Traversal', 'Level-order Traversal'],
              correctOptionIndex: 1,
              explanation: 'Preorder traversal visits Root first, then Left subtree, then Right subtree.'
            },
            {
              questionText: 'What sequence does an Inorder traversal produce when applied to a Binary Search Tree?',
              options: [
                'Descending order keys',
                'Sorted ascending order keys',
                'Reverse postorder sequence',
                'Random unordered keys'
              ],
              correctOptionIndex: 1,
              explanation: 'Inorder traversal (Left, Root, Right) on a BST yields keys in strictly ascending sorted order.'
            },
            {
              questionText: 'What is the worst-case search time complexity in a degenerate (skewed) Binary Search Tree?',
              options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
              correctOptionIndex: 2,
              explanation: 'A skewed BST degenerates into a linked list, degrading search time to O(n).'
            },
            {
              questionText: 'When representing a sparse graph with V vertices and E edges, which representation is more space-efficient?',
              options: ['Adjacency Matrix (O(V^2))', 'Adjacency List (O(V + E))', 'Incidence Matrix', 'Full Mesh Table'],
              correctOptionIndex: 1,
              explanation: 'An adjacency list uses O(V + E) space, which is far more efficient than O(V^2) for sparse graphs.'
            },
            {
              questionText: 'When deleting a BST node with two children, what is typically substituted in its place?',
              options: [
                'The root node of the entire tree',
                'Its Inorder Successor (smallest node in right subtree) or Inorder Predecessor',
                'A NULL pointer',
                'Its deepest left leaf'
              ],
              correctOptionIndex: 1,
              explanation: 'The inorder successor or predecessor preserves the BST ordering invariant when replacing a two-child node.'
            },
            {
              questionText: 'What data structure is used to implement Breadth-First Search (BFS) in a graph?',
              options: ['Stack', 'Queue', 'Priority Queue', 'Set only'],
              correctOptionIndex: 1,
              explanation: 'BFS uses a FIFO queue to discover vertices level-by-level.'
            },
            {
              questionText: 'What is the time complexity of BFS or DFS on a graph with V vertices and E edges using an Adjacency List?',
              options: ['O(V * E)', 'O(V + E)', 'O(V^2)', 'O(log(V + E))'],
              correctOptionIndex: 1,
              explanation: 'Both BFS and DFS visit every vertex once and inspect every edge once, yielding O(V + E) complexity.'
            },
            {
              questionText: 'What is the maximum number of nodes in a binary tree of height h (where a tree with only the root has h = 1)?',
              options: ['2^h - 1', '2^(h - 1)', '2h', 'h^2'],
              correctOptionIndex: 0,
              explanation: 'A full binary tree of height h has 1 + 2 + 4 + ... + 2^(h-1) = 2^h - 1 nodes.'
            },
            {
              questionText: 'Which graph algorithm can be used to detect whether a directed graph contains a cycle?',
              options: ['Binary Search', 'DFS with visited and recursion stack tracking', 'Linear Probing', 'Bubble Sort'],
              correctOptionIndex: 1,
              explanation: 'DFS tracks back edges via a recursion call stack to detect cycles in directed graphs.'
            }
          ]
        }
      },
      {
        moduleNumber: 6,
        title: 'Heaps, Hashing and Complexity',
        slug: 'heaps-hashing-and-complexity',
        summary: 'Study priority queues using min-heaps and max-heaps, hash tables, hash functions, collision resolution strategies, and comprehensive time and space complexity evaluations.',
        estimatedMinutes: 24,
        keyConcepts: ['Min-Heap', 'Max-Heap', 'Heapify', 'Hash Table', 'Hash Collision', 'Chaining vs Open Addressing', 'Complexity Trade-offs'],
        topics: [
          {
            topicNumber: 17,
            title: 'Min-heaps, Max-heaps and Hash Tables',
            estimatedMinutes: 12,
            pdfUrl: '/materials/17_Heaps_and_Hashing.pdf'
          },
          {
            topicNumber: 18,
            title: 'Time and Space Complexity',
            estimatedMinutes: 12,
            pdfUrl: '/materials/18_Time_and_Space_Complexity.pdf'
          }
        ],
        content: `
# Module 6: Heaps, Hashing and Complexity
Total: 24 minutes

Heaps provide optimal priority retrieval, while Hash Tables provide average constant-time $O(1)$ lookups. Understanding these structures completes the core data structure toolkit.

---

## 17. Min-heaps, Max-heaps and Hash Tables (12 min)
- **Binary Heap:** A complete binary tree stored compactly in an array without pointer overhead.
  - Parent of index $i$: $\\lfloor(i - 1) / 2\\rfloor$
  - Left child: $2i + 1$, Right child: $2i + 2$
  - **Max-Heap Property:** $\\text{Parent} \\ge \\text{Children}$. Root contains maximum element.
  - **Min-Heap Property:** $\\text{Parent} \\le \\text{Children}$. Root contains minimum element.
  - **Heap Operations:**
    - \`insert(x)\`: Append at end and bubble up ($O(\\log n)$).
    - \`extractMin()\` / \`extractMax()\`: Swap root with last, remove last, and sift down ($O(\\log n)$).
    - \`buildHeap\`: Converts unsorted array to heap in $O(n)$ time.
- **Hash Tables:**
  - Map keys to bucket indices using a hash function: $\\text{index} = h(\\text{key}) \\pmod M$.
  - **Collision Resolution:**
    1. *Separate Chaining:* Each bucket holds a linked list of collided key-value pairs.
    2. *Open Addressing:* Probing for the next empty slot (Linear Probing, Quadratic Probing, Double Hashing).
  - Average Case: $O(1)$ insert, lookup, delete. Worst Case (all keys collide): $O(n)$.

---

## 18. Time and Space Complexity Summary (12 min)

| Data Structure | Access | Search | Insertion | Deletion | Space Overhead |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Array** | $O(1)$ | $O(n)$ | $O(n)$ | $O(n)$ | Minimal contiguous |
| **Linked List** | $O(n)$ | $O(n)$ | $O(1)^*$ | $O(1)^*$ | 1-2 pointers/node |
| **Stack / Queue** | $O(n)$ | $O(n)$ | $O(1)$ | $O(1)$ | Minimal LIFO/FIFO |
| **BST (Balanced)** | $O(\\log n)$ | $O(\\log n)$ | $O(\\log n)$ | $O(\\log n)$ | 2 pointers/node |
| **Binary Heap** | $O(1)^\\dagger$ | $O(n)$ | $O(\\log n)$ | $O(\\log n)$ | Array-backed |
| **Hash Table** | N/A | $O(1)$ avg | $O(1)$ avg | $O(1)$ avg | Table load factor |

$^*$*Insertion/deletion at head/tail with pointer.*
$^\\dagger$*Peak min/max access.*
        `,
        quiz: {
          title: 'Heaps, Hashing and Complexity Assessment',
          questions: [
            {
              questionText: 'In a Min-Heap, what invariant must be preserved at every node?',
              options: [
                'The key of the parent node is less than or equal to the keys of its children',
                'The key of the parent node is greater than its children',
                'All left children must be greater than right children',
                'Every node must have exactly two non-null children'
              ],
              correctOptionIndex: 0,
              explanation: 'In a min-heap, the parent node is always less than or equal to its children, keeping the minimum at the root.'
            },
            {
              questionText: 'For a binary heap element stored at index i in an array, what is the index of its parent?',
              options: ['2 * i', 'floor((i - 1) / 2)', '2 * i + 1', 'i / 2 + 1'],
              correctOptionIndex: 1,
              explanation: 'In zero-indexed array heap representation, the parent of node i is at Math.floor((i - 1) / 2).'
            },
            {
              questionText: 'What is the average-case time complexity of searching a key in a Hash Table with a well-designed hash function?',
              options: ['O(log n)', 'O(n)', 'O(1)', 'O(n^2)'],
              correctOptionIndex: 2,
              explanation: 'With minimal collisions, direct hash index calculation allows O(1) constant-time search on average.'
            },
            {
              questionText: 'How does Separate Chaining resolve hash collisions in a Hash Table?',
              options: [
                'By searching linearly for the next vacant slot in the array',
                'By maintaining a linked list of entries at each table index bucket',
                'By immediately resizing the table to double its capacity',
                'By discarding the older entry'
              ],
              correctOptionIndex: 1,
              explanation: 'Separate chaining stores collided entries in a linked list attached to the bucket index.'
            },
            {
              questionText: 'What is the time complexity of building a Binary Heap from an unsorted array of n elements (buildHeap)?',
              options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'],
              correctOptionIndex: 1,
              explanation: 'Bottom-up heap construction runs in mathematically proven linear O(n) time.'
            },
            {
              questionText: 'What is the load factor (alpha) of a Hash Table with n stored elements and m table buckets?',
              options: ['alpha = n * m', 'alpha = n / m', 'alpha = m / n', 'alpha = n - m'],
              correctOptionIndex: 1,
              explanation: 'The load factor is defined as alpha = n / m (ratio of stored items to bucket capacity).'
            },
            {
              questionText: 'What is the time complexity of extracting the minimum element from a Min-Heap of n items?',
              options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
              correctOptionIndex: 1,
              explanation: 'Extracting min removes the root, places the last leaf at the root, and sift-downs in O(log n) time.'
            },
            {
              questionText: 'What occurs during primary clustering in linear probing collision resolution?',
              options: [
                'Hash codes become completely unique',
                'Long contiguous runs of occupied slots build up, slowing down search and insertion times',
                'All elements are moved to a binary tree',
                'Memory is automatically garbage collected'
              ],
              correctOptionIndex: 1,
              explanation: 'Linear probing causes adjacent collisions to merge into long clusters, increasing average probe lengths.'
            },
            {
              questionText: 'Which sorting algorithm uses a Binary Heap to achieve O(n log n) worst-case time with O(1) auxiliary space?',
              options: ['Merge Sort', 'Quick Sort', 'Heap Sort', 'Radix Sort'],
              correctOptionIndex: 2,
              explanation: 'Heap Sort builds a heap and repeatedly extracts root elements in-place using O(1) extra space.'
            },
            {
              questionText: 'Under what condition does hash table search degrade to O(n) worst-case time?',
              options: [
                'When the table is empty',
                'When every single key hashes to the exact same bucket slot',
                'When all keys are even numbers',
                'When the load factor is less than 0.5'
              ],
              correctOptionIndex: 1,
              explanation: 'If all keys collide into one bucket, the bucket becomes a linear list of n items, taking O(n) to search.'
            }
          ]
        }
      }
    ]
  },
  {
    code: 'SE',
    title: 'Software Engineering',
    slug: 'software-engineering',
    durationHours: 0,
    lessonCount: 0,
    image: '/images/SE.png',
    description: 'Systematic approaches to software design, agile methodologies, requirements engineering, design patterns, testing, and CI/CD pipelines.',
    order: 3,
    modules: []
  },
  {
    code: 'OS',
    title: 'Operating System',
    slug: 'operating-system',
    durationHours: 0,
    lessonCount: 0,
    image: '/images/OS.png',
    description: 'Kernel architectures, process management, CPU scheduling, synchronization, deadlocks, virtual memory paging, and file system implementations.',
    order: 4,
    modules: []
  },
  {
    code: 'DBMS',
    title: 'DBMS',
    slug: 'dbms',
    durationHours: 0,
    lessonCount: 0,
    image: '/images/DBMS.png',
    description: 'Relational database design, normalization (1NF through BCNF), indexing, transactions, ACID properties, concurrency control, and SQL optimization.',
    order: 5,
    modules: []
  },
  {
    code: 'WAD',
    title: 'Web Application and Development',
    slug: 'web-application-and-development',
    durationHours: 0,
    lessonCount: 0,
    image: '/images/WAD.png',
    description: 'Full-stack web engineering with Node.js, Express, MongoDB, RESTful API design, authentication, session security, and dynamic responsive user interfaces.',
    order: 6,
    modules: []
  }
];

async function seedDatabase() {
  try {
    console.log('[Seed] Starting database seed...');
    await connectDB();

    for (const cData of coursesData) {
      const course = await Course.findOneAndUpdate(
        { code: cData.code },
        {
          code: cData.code,
          title: cData.title,
          slug: cData.slug,
          durationHours: cData.durationHours,
          lessonCount: cData.lessonCount,
          image: cData.image,
          description: cData.description,
          order: cData.order
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[Seed] Course upserted: ${course.title} (${course.code})`);

      // If course has no modules (materials removed for now), clean up any previously seeded modules and quizzes
      if (!cData.modules || cData.modules.length === 0) {
        const existingModules = await Module.find({ courseId: course._id });
        if (existingModules.length > 0) {
          const modIds = existingModules.map(m => m._id);
          await Quiz.deleteMany({ moduleId: { $in: modIds } });
          await Module.deleteMany({ courseId: course._id });
          console.log(`  [Seed] Cleaned up existing modules and quizzes for ${course.code} (Materials removed)`);
        }
      } else {
        // First delete any old modules for this course not present in new modules list
        const newModuleNumbers = cData.modules.map(m => m.moduleNumber);
        const oldModules = await Module.find({ courseId: course._id, moduleNumber: { $nin: newModuleNumbers } });
        if (oldModules.length > 0) {
          const oldIds = oldModules.map(m => m._id);
          await Quiz.deleteMany({ moduleId: { $in: oldIds } });
          await Module.deleteMany({ _id: { $in: oldIds } });
        }

        // Upsert each module
        for (const mData of cData.modules) {
          const { quiz, topics, ...modFields } = mData;

          const moduleDoc = await Module.findOneAndUpdate(
            { courseId: course._id, moduleNumber: mData.moduleNumber },
            {
              ...modFields,
              topics: topics || [],
              courseId: course._id
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          console.log(`  [Seed] Module upserted: #${moduleDoc.moduleNumber} ${moduleDoc.title}`);

          // Upsert Quiz if provided
          if (quiz && quiz.questions && quiz.questions.length === 10) {
            await Quiz.findOneAndUpdate(
              { courseId: course._id, moduleId: moduleDoc._id },
              {
                title: quiz.title,
                courseId: course._id,
                moduleId: moduleDoc._id,
                passingScore: 6,
                totalQuestions: 10,
                questions: quiz.questions
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`    [Seed] Quiz upserted: 10 questions for module "${moduleDoc.title}"`);
          }
        }
      }
    }

    console.log('[Seed] Database seed completed successfully!');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
}

// Allow direct CLI execution: node scripts/seed.js
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('[Seed] Exiting process.');
    process.exit(0);
  });
}

module.exports = { seedDatabase };
