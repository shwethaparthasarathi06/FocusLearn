const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('../config/db');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const StudySession = require('../models/StudySession');
const User = require('../models/User');

// ---------------------------------------------------------------------------
// Course and module data
// ---------------------------------------------------------------------------
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
    lessonCount: 3,
    image: '/images/DS.png',
    description: 'Master core computational structures including Introduction to Data Structures, Stacks & Queues, and Linked Lists with algorithm complexity analysis.',
    order: 2,
    category: 'Master of Computer Applications',
    modules: [
      {
        moduleNumber: 1,
        title: 'Introduction to Data Structures',
        slug: 'introduction-to-data-structures',
        summary: 'Understand what data structures are, primitive vs non-primitive classifications, linear vs non-linear organizations, and algorithm analysis with Big-O notation.',
        estimatedMinutes: 38,
        pdfUrl: '/materials/Data_Structure.pdf',
        content: 'Understand what data structures are, primitive vs non-primitive classifications, linear vs non-linear organizations, and algorithm analysis with Big-O notation.',
        topics: [
          {
            topicNumber: 1,
            title: 'Introduction to Data Structures',
            estimatedMinutes: 38,
            pdfUrl: '/materials/Data_Structure.pdf'
          }
        ],
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
        title: 'Stacks and Queues',
        slug: 'stacks-and-queues',
        summary: 'Explore LIFO and FIFO data structures, stack push/pop operations, expression conversions (infix, prefix, postfix), queue enqueue/dequeue, circular queues, and deques.',
        estimatedMinutes: 50,
        pdfUrl: '/materials/Stack_Queue.pdf',
        content: 'Explore LIFO and FIFO data structures, stack push/pop operations, expression conversions (infix, prefix, postfix), queue enqueue/dequeue, circular queues, and deques.',
        topics: [
          {
            topicNumber: 1,
            title: 'Stacks and Queues',
            estimatedMinutes: 50,
            pdfUrl: '/materials/Stack_Queue.pdf'
          }
        ],
        quiz: {
          title: 'Stacks and Queues Assessment',
          questions: [
            {
              questionText: 'What operational discipline does a Stack data structure follow?',
              options: ['FIFO (First In, First Out)', 'LIFO (Last In, First Out)', 'Random Access Priority', 'Hierarchical Ordering'],
              correctOptionIndex: 1,
              explanation: 'A stack operates on LIFO (Last In, First Out) discipline, where the most recently added item is the first removed.'
            },
            {
              questionText: 'What operational discipline does a standard Queue data structure follow?',
              options: ['LIFO (Last In, First Out)', 'FIFO (First In, First Out)', 'LILO (Last In, Last Out only)', 'Priority Weighting'],
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
        moduleNumber: 3,
        title: 'Linked List',
        slug: 'linked-list',
        summary: 'Master dynamic non-contiguous node storage, pointer manipulation, singly linked lists, doubly linked lists, circular linked lists, and polynomial applications.',
        estimatedMinutes: 46,
        pdfUrl: '/materials/Linked_List.pdf',
        content: 'Master dynamic non-contiguous node storage, pointer manipulation, singly linked lists, doubly linked lists, circular linked lists, and polynomial applications.',
        topics: [
          {
            topicNumber: 1,
            title: 'Linked List',
            estimatedMinutes: 46,
            pdfUrl: '/materials/Linked_List.pdf'
          }
        ],
        quiz: {
          title: 'Linked Lists Assessment',
          questions: [
            {
              questionText: 'What are the two standard components of a node in a Singly Linked List?',
              options: ['Two data values', 'Data field and a Next pointer', 'Key and Array of children', 'Row index and Column index'],
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
              questionText: 'In a Circular Doubly Linked List, what does the prev pointer of the head node point to?',
              options: ['NULL', 'The tail (last) node', 'The head node itself', 'The second node'],
              correctOptionIndex: 1,
              explanation: 'In a circular doubly linked list, the head prev pointer references the tail node, and the tail next pointer references the head node.'
            },
            {
              questionText: 'What is the time complexity to delete the last node in a Singly Linked List if only the head pointer is known?',
              options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
              correctOptionIndex: 1,
              explanation: 'One must traverse the entire list from head to find the second-to-last node, which takes O(n) time.'
            },
            {
              questionText: 'What is a Header Linked List?',
              options: [
                'A linked list stored on an external hard drive header block',
                'A linked list containing a special dummy node at the beginning that stores metadata or simplifies edge cases',
                'A list that only permits insertions at the header',
                'A list with multiple head pointers for concurrency'
              ],
              correctOptionIndex: 1,
              explanation: 'A header linked list always maintains a dummy header node at the start to eliminate special boundary conditions for head insertion/deletion.'
            },
            {
              questionText: 'Which application commonly uses a Doubly Linked List combined with a Hash Map for O(1) operations?',
              options: ['LRU (Least Recently Used) Cache', 'Depth-First Search', 'Quick Sort recursion stack', 'Binary Heap'],
              correctOptionIndex: 0,
              explanation: 'An LRU Cache implementation combines a doubly linked list with a hash map to achieve O(1) retrieval and O(1) node relocation.'
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
    description: 'Software development lifecycle, Agile methodologies, requirements engineering, architectural design patterns, software testing, and CI/CD pipelines.',
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
    description: 'Process management, thread scheduling, CPU scheduling algorithms, memory management, virtual memory, paging, deadlocks, file systems, and I/O systems.',
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

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------
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
          order: cData.order,
          category: cData.category || 'Master of Computer Applications'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[Seed] Course upserted: ${course.title} (${course.code})`);

      if (cData.modules && cData.modules.length) {
        // Clear old modules & quizzes for this course to prevent duplicates
        await Module.deleteMany({ courseId: course._id });
        await Quiz.deleteMany({ courseId: course._id });

        for (const mData of cData.modules) {
          const module = await Module.create({
            courseId: course._id,
            moduleNumber: mData.moduleNumber,
            title: mData.title,
            slug: mData.slug,
            summary: mData.summary,
            estimatedMinutes: mData.estimatedMinutes,
            pdfUrl: mData.pdfUrl,
            topics: mData.topics,
            content: mData.content || mData.summary,
            order: mData.moduleNumber
          });
          console.log(`[Seed] Module created: #${module.moduleNumber} ${module.title}`);

          if (mData.quiz) {
            const quiz = await Quiz.create({
              moduleId: module._id,
              courseId: course._id,
              title: mData.quiz.title,
              passingScore: 6,
              totalQuestions: mData.quiz.questions.length,
              questions: mData.quiz.questions
            });
            console.log(`[Seed] Quiz created: "${quiz.title}" with ${quiz.questions.length} questions for module "${module.title}"`);
          }
        }
      }
    }

    // Verify user exists and ensure at least one sample study session exists
    const user = await User.findOne();
    if (user) {
      const dsCourse = await Course.findOne({ code: 'DS' });
      const firstMod = await Module.findOne({ courseId: dsCourse._id, moduleNumber: 1 });
      if (firstMod) {
        const existingSession = await StudySession.findOne({ userId: user._id, moduleId: firstMod._id });
        if (!existingSession) {
          await StudySession.create({
            userId: user._id,
            courseId: dsCourse._id,
            moduleId: firstMod._id,
            plannedDurationMinutes: firstMod.estimatedMinutes,
            actualDurationSeconds: 120,
            status: 'completed',
            completed: true,
            startTime: new Date(Date.now() - 3600000),
            endTime: new Date()
          });
          console.log(`[Seed] Sample study session created for user ${user.name}`);
        }
      }
    }

    console.log('[Seed] Database seed completed successfully!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
