const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('../config/db');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const StudySession = require('../models/StudySession');
const StudyMaterial = require('../models/StudyMaterial');
const User = require('../models/User');

// Helper to create 10-question quiz structure
const coursesData = [
  // -------------------------------------------------------------------------
  // 1. APPLIED MATHEMATICS (AMCS)
  // -------------------------------------------------------------------------
  {
    code: 'AMCS',
    title: 'Applied Mathematics',
    slug: 'applied-mathematics',
    durationHours: 2.0,
    lessonCount: 3,
    image: '/images/AMCS.png',
    description: 'Foundational discrete mathematics, linear algebra, numerical optimization, and probability theory essential for computer science and machine learning algorithms.',
    order: 1,
    category: 'Master of Computer Applications',
    modules: [
      {
        moduleNumber: 1,
        title: 'Gradient Descent & Numerical Optimization',
        slug: 'gradient-descent-and-numerical-optimization',
        summary: 'Master cost functions, partial derivatives, learning rates, convex optimization, local vs global minima, and stochastic gradient descent.',
        estimatedMinutes: 45,
        pdfUrl: '/materials/Gradient_Descent.docx.pdf',
        keyConcepts: ['Gradient Descent', 'Cost Function', 'Learning Rate', 'Convex Optimization', 'SGD'],
        content: `Gradient Descent is an iterative optimization algorithm used to find the minimum of a differentiable objective function.
In machine learning, it adjusts parameters iteratively in the direction of the steepest descent (the negative gradient) of the cost function.
Key formulation:
theta = theta - alpha * grad(J(theta))
where alpha is the learning rate and grad(J(theta)) is the vector of partial derivatives.
When alpha is too large, the algorithm can overshoot and diverge; if alpha is too small, convergence becomes exceedingly slow.
Variants include Batch Gradient Descent (calculating gradients over the entire dataset), Stochastic Gradient Descent (evaluating one sample at a time for fast, noisy updates), and Mini-batch Gradient Descent (balancing stability and hardware acceleration).`,
        topics: [
          {
            topicNumber: 1,
            title: 'Gradient Descent & Numerical Optimization',
            estimatedMinutes: 45,
            pdfUrl: '/materials/Gradient_Descent.docx.pdf'
          }
        ],
        quiz: {
          title: 'Gradient Descent & Numerical Optimization Assessment',
          questions: [
            {
              questionText: 'What does the gradient vector of a multivariable function geometrically represent?',
              options: [
                'The direction of the steepest descent',
                'The direction of the steepest ascent and maximum rate of increase',
                'The curvature of the contour lines',
                'The integral of the function over Euclidean space'
              ],
              correctOptionIndex: 1,
              explanation: 'The gradient vector points in the direction of the greatest rate of increase (steepest ascent); moving in its negative direction achieves steepest descent.'
            },
            {
              questionText: 'What is the primary risk of setting a learning rate (alpha) that is too large?',
              options: [
                'The algorithm will get permanently trapped in the initial point',
                'The optimization will overshoot the minimum and diverge',
                'The computational complexity per step increases exponentially',
                'Memory consumption doubles on every iteration'
              ],
              correctOptionIndex: 1,
              explanation: 'An excessively large learning rate causes updates to step past the valley minimum, causing oscillations and numerical divergence.'
            },
            {
              questionText: 'In a strictly convex cost function, what is guaranteed about local minima?',
              options: [
                'There are infinitely many local minima with different costs',
                'Every local minimum is also the global minimum',
                'No local minima exist anywhere in the parameter space',
                'The minimum can only be reached using a non-zero momentum term'
              ],
              correctOptionIndex: 1,
              explanation: 'For strictly convex functions, any local minimum is uniquely the global minimum, guaranteeing convergence to the optimal solution.'
            },
            {
              questionText: 'How does Stochastic Gradient Descent (SGD) differ from Batch Gradient Descent?',
              options: [
                'SGD evaluates gradients using a single random training sample per step',
                'SGD never calculates partial derivatives',
                'SGD requires processing the entire dataset before making any parameter updates',
                'SGD is restricted solely to linear regression problems'
              ],
              correctOptionIndex: 0,
              explanation: 'SGD updates parameters after evaluating just one training sample, resulting in faster and noisier steps that can escape shallow local minima.'
            },
            {
              questionText: 'What is a saddle point in multivariable calculus optimization?',
              options: [
                'A point where all partial derivatives are non-zero',
                'A point where the gradient is zero, but it is neither a local minimum nor a local maximum',
                'The absolute highest peak of the cost surface',
                'A point where the cost function ceases to be continuous'
              ],
              correctOptionIndex: 1,
              explanation: 'At a saddle point, the first derivatives equal zero, but orthogonal cross-sections show positive curvature in one direction and negative curvature in another.'
            },
            {
              questionText: 'What role does the Momentum method play in gradient descent?',
              options: [
                'It accelerates updates along persistent directions and dampens transverse oscillations',
                'It resets the weights to zero whenever a plateau is detected',
                'It eliminates the need for computing the learning rate',
                'It converts non-convex problems into linear equations'
              ],
              correctOptionIndex: 0,
              explanation: 'Momentum accumulates an exponentially decaying moving average of past gradients, speeding up progress along flat ravines and reducing oscillations.'
            },
            {
              questionText: 'What is the gradient of the Mean Squared Error (MSE) cost function with respect to weights?',
              options: [
                'The product of actual values and activations',
                'Proportional to the average error residual multiplied by input features',
                'Equal to the constant bias term',
                'The second derivative matrix (Hessian) alone'
              ],
              correctOptionIndex: 1,
              explanation: 'Differentiating MSE (1/2m * sum(y_hat - y)^2) yields 1/m * sum((y_hat - y) * x), showing gradient magnitude scales with prediction error and input size.'
            },
            {
              questionText: 'Why is feature scaling (e.g., standard normalization) crucial before running gradient descent?',
              options: [
                'It prevents integer overflow in Python and Node.js runtimes',
                'It produces spherical contours that allow faster, direct convergence without zigzagging',
                'It reduces the number of dimensions in the dataset',
                'It guarantees that the learning rate can be set to 1.0'
              ],
              correctOptionIndex: 1,
              explanation: 'Unscaled features create elongated elliptical cost contours where gradients point perpendicularly to the minimum, causing inefficient zigzagging.'
            },
            {
              questionText: 'Which adaptive learning rate optimization algorithm maintains separate moving averages of both past gradients and squared gradients?',
              options: ['Adagrad', 'Adam (Adaptive Moment Estimation)', 'Classical Newton-Raphson', 'Coordinate Descent'],
              correctOptionIndex: 1,
              explanation: 'Adam combines first-order momentum (first moment) with RMSprop-style squared gradient scaling (second moment) with bias correction.'
            },
            {
              questionText: 'What stopping criterion is commonly used to terminate gradient descent iterations?',
              options: [
                'When the gradient norm drops below a small threshold epsilon or changes in cost become negligible',
                'When total elapsed system time exceeds exactly 60 seconds',
                'When the weights alternate between positive and negative values',
                'When all input values equal zero'
              ],
              correctOptionIndex: 0,
              explanation: 'Convergence is verified when the Euclidean norm of the gradient vector is close to zero (||grad|| < eps) or cost delta falls below a tolerance.'
            }
          ]
        }
      },
      {
        moduleNumber: 2,
        title: 'Linear Algebra & Matrix Computations',
        slug: 'linear-algebra-and-matrix-computations',
        summary: 'Explore vector spaces, matrix multiplication properties, determinants, rank, nullity, eigenvalues, and eigenvectors with computational applications.',
        estimatedMinutes: 40,
        pdfUrl: '/materials/LinearAlgebra.pptx',
        keyConcepts: ['Linear Algebra', 'Eigenvalues', 'Eigenvectors', 'Matrix Rank', 'Determinants'],
        content: `Linear Algebra provides the computational foundation for computer science, graphics, cryptography, and machine learning.
A vector space is a collection of objects (vectors) that can be added together and multiplied by scalars.
Key concepts:
1. Matrix Rank: The maximum number of linearly independent row or column vectors in the matrix.
2. Determinant: A scalar attribute of a square matrix that indicates whether the matrix is invertible (det != 0).
3. Eigenvalues and Eigenvectors: Satisfy the characteristic equation A * v = lambda * v, or (A - lambda * I) * v = 0.
Eigen decomposition forms the mathematical backbone of Principal Component Analysis (PCA), PageRank, and vibration analysis.`,
        topics: [
          {
            topicNumber: 1,
            title: 'Linear Algebra & Matrix Computations',
            estimatedMinutes: 40,
            pdfUrl: '/materials/LinearAlgebra.pptx'
          }
        ],
        quiz: {
          title: 'Linear Algebra & Matrix Computations Assessment',
          questions: [
            {
              questionText: 'Under what condition is a square matrix A considered invertible (non-singular)?',
              options: [
                'Its determinant is non-zero (det(A) != 0)',
                'Its trace equals zero',
                'All its diagonal entries must be positive integers',
                'It must be a symmetric upper triangular matrix'
              ],
              correctOptionIndex: 0,
              explanation: 'A square matrix has a unique multiplicative inverse if and only if its determinant is non-zero, meaning its rows/columns are linearly independent.'
            },
            {
              questionText: 'What is the Rank of an m x n matrix?',
              options: [
                'The sum of all elements across the primary diagonal',
                'The maximum number of linearly independent row or column vectors',
                'The total count of non-zero entries in the matrix',
                'The product of the row count and column count'
              ],
              correctOptionIndex: 1,
              explanation: 'Rank quantifies the dimensionality of the vector space spanned by the rows or columns of a matrix.'
            },
            {
              questionText: 'What equation defines an eigenvalue lambda and corresponding eigenvector v for a square matrix A?',
              options: [
                'A * v = lambda * v (where v != 0)',
                'A + v = lambda * I',
                'det(A * v) = lambda',
                'A^T * A = lambda * v'
              ],
              correctOptionIndex: 0,
              explanation: 'An eigenvector v experiences only scaling by a scalar factor lambda when linear transformation A is applied: A * v = lambda * v.'
            },
            {
              questionText: 'What does the Rank-Nullity Theorem state for an m x n linear transformation matrix?',
              options: [
                'Rank + Nullity = n (the number of columns / dimension of the domain)',
                'Rank * Nullity = m * n',
                'Rank - Nullity = det(A)',
                'Rank + Nullity = 0'
              ],
              correctOptionIndex: 0,
              explanation: 'The fundamental Rank-Nullity theorem asserts that Dim(Range) + Dim(Kernel) = Dim(Domain), meaning Rank + Nullity = n.'
            },
            {
              questionText: 'What is the determinant of a 2x2 matrix with rows [a, b] and [c, d]?',
              options: ['a * c - b * d', 'a * d - b * c', 'a * b + c * d', '(a + d) / (b + c)'],
              correctOptionIndex: 1,
              explanation: 'The determinant of a 2x2 matrix [[a, b], [c, d]] is computed as a*d - b*c.'
            },
            {
              questionText: 'If two vectors u and v in Euclidean space have an inner (dot) product of zero, what are they?',
              options: ['Parallel and collinear', 'Orthogonal (perpendicular)', 'Invertible', 'Linearly dependent'],
              correctOptionIndex: 1,
              explanation: 'When u . v = 0 for non-zero vectors, the angle theta between them satisfies cos(theta) = 0, proving they are orthogonal.'
            },
            {
              questionText: 'What is the transpose of an orthogonal matrix Q?',
              options: [
                'Q^T = -Q',
                'Q^T = Q^(-1) (its inverse)',
                'Q^T = 0',
                'Q^T = det(Q) * I'
              ],
              correctOptionIndex: 1,
              explanation: 'An orthogonal matrix satisfies Q^T * Q = I, which means its transpose is identical to its inverse (Q^T = Q^(-1)).'
            },
            {
              questionText: 'What is the trace of a square matrix?',
              options: [
                'The product of all entries in the first column',
                'The sum of the diagonal elements from the top-left to bottom-right',
                'The maximum absolute eigenvalue',
                'The difference between row rank and column rank'
              ],
              correctOptionIndex: 1,
              explanation: 'The trace of an n x n matrix is the sum of its main diagonal elements, which also equals the sum of its eigenvalues.'
            },
            {
              questionText: 'How is the characteristic polynomial of a matrix A formulated to compute eigenvalues?',
              options: [
                'det(A - lambda * I) = 0',
                'trace(A) * lambda = 1',
                'A^2 - lambda^2 = 0',
                'det(A) + lambda = 0'
              ],
              correctOptionIndex: 0,
              explanation: 'Solving the characteristic equation det(A - lambda * I) = 0 yields the eigenvalues lambda as its roots.'
            },
            {
              questionText: 'Which linear algebraic decomposition factors a real matrix into U * Sigma * V^T?',
              options: [
                'Cholesky Decomposition',
                'Singular Value Decomposition (SVD)',
                'LU Factorization with pivoting',
                'QR Gram-Schmidt factorization'
              ],
              correctOptionIndex: 1,
              explanation: 'SVD decomposes any m x n matrix into orthogonal matrices U and V and a diagonal matrix Sigma containing singular values.'
            }
          ]
        }
      },
      {
        moduleNumber: 3,
        title: 'Probability Theory & Random Variables',
        slug: 'probability-theory-and-random-variables',
        summary: 'Understand sample spaces, Bayes theorem, discrete and continuous random variables, probability mass/density functions, expectation, and variance.',
        estimatedMinutes: 35,
        pdfUrl: '/materials/Random_Variables.pptx.pdf',
        keyConcepts: ['Probability', 'Random Variables', 'Bayes Theorem', 'Expectation', 'Variance'],
        content: `Probability theory provides the mathematical language for reasoning under uncertainty.
Key areas:
1. Bayes' Theorem: P(A|B) = [P(B|A) * P(A)] / P(B), describing how prior beliefs are updated in light of new evidence.
2. Discrete Random Variables: Characterized by a Probability Mass Function (PMF), e.g., Bernoulli, Binomial, and Poisson distributions.
3. Continuous Random Variables: Characterized by a Probability Density Function (PDF) where P(a <= X <= b) is the integral of f(x)dx from a to b.
4. Expected Value and Variance: E[X] represents the long-term central tendency; Var(X) = E[X^2] - (E[X])^2 measures statistical dispersion.`,
        topics: [
          {
            topicNumber: 1,
            title: 'Probability Theory & Random Variables',
            estimatedMinutes: 35,
            pdfUrl: '/materials/Random_Variables.pptx.pdf'
          }
        ],
        quiz: {
          title: 'Probability Theory & Random Variables Assessment',
          questions: [
            {
              questionText: 'What is Bayes Theorem mathematically expressed as?',
              options: [
                'P(A|B) = [P(B|A) * P(A)] / P(B)',
                'P(A|B) = P(A) * P(B)',
                'P(A|B) = P(A) + P(B) - P(A and B)',
                'P(A|B) = P(B|A) / P(A)'
              ],
              correctOptionIndex: 0,
              explanation: 'Bayes Theorem relates posterior probability P(A|B) to likelihood P(B|A), prior P(A), and marginal evidence P(B).'
            },
            {
              questionText: 'What is the fundamental property of any valid Probability Density Function (PDF) f(x) over (-inf, +inf)?',
              options: [
                'f(x) <= 0 everywhere',
                'f(x) >= 0 for all x, and the integral of f(x)dx from -inf to +inf equals 1',
                'f(x) must equal 1 at x = 0',
                'The derivative of f(x) must always be constant'
              ],
              correctOptionIndex: 1,
              explanation: 'A PDF must be non-negative everywhere and integrate to 1 over its entire domain.'
            },
            {
              questionText: 'What is the probability of a continuous random variable taking on any single exact exact point value P(X = c)?',
              options: ['1.0', '0.0', '0.5', 'f(c)'],
              correctOptionIndex: 1,
              explanation: 'For continuous random variables, probability corresponds to area under the curve; the area over a single point is zero.'
            },
            {
              questionText: 'What formula defines the Variance of a random variable X in terms of Expectation?',
              options: [
                'Var(X) = E[X^2] - (E[X])^2',
                'Var(X) = (E[X])^2 - E[X]',
                'Var(X) = E[X] / 2',
                'Var(X) = sqrt(E[X^2])'
              ],
              correctOptionIndex: 0,
              explanation: 'Variance is defined as E[(X - E[X])^2], which algebraically simplifies to E[X^2] - (E[X])^2.'
            },
            {
              questionText: 'If two random events A and B are statistically independent, what does P(A and B) equal?',
              options: [
                'P(A) + P(B)',
                'P(A) * P(B)',
                'P(A) / P(B)',
                '0'
              ],
              correctOptionIndex: 1,
              explanation: 'Independent events satisfy the multiplicative rule: the joint probability equals the product of their individual probabilities.'
            },
            {
              questionText: 'What is the Cumulative Distribution Function (CDF) F(x) defined as?',
              options: [
                'F(x) = P(X > x)',
                'F(x) = P(X <= x)',
                'F(x) = d/dx [f(x)]',
                'F(x) = 1 / f(x)'
              ],
              correctOptionIndex: 1,
              explanation: 'The CDF F(x) represents the probability that random variable X takes a value less than or equal to x.'
            },
            {
              questionText: 'Which discrete distribution models the number of successes in n independent Bernoulli trials with probability p?',
              options: ['Poisson Distribution', 'Uniform Distribution', 'Binomial Distribution', 'Exponential Distribution'],
              correctOptionIndex: 2,
              explanation: 'The Binomial distribution models the number of successes k in n independent trials, given by C(n,k) * p^k * (1-p)^(n-k).'
            },
            {
              questionText: 'What is the expected value (mean) of a Poisson distribution with parameter lambda?',
              options: ['lambda^2', 'lambda', '1 / lambda', 'sqrt(lambda)'],
              correctOptionIndex: 1,
              explanation: 'For a Poisson distribution, both the expected value and the variance are equal to lambda.'
            },
            {
              questionText: 'According to the Central Limit Theorem (CLT), what distribution does the sample mean approach as sample size n grows large?',
              options: ['Uniform Distribution', 'Normal (Gaussian) Distribution', 'Cauchy Distribution', 'Discrete Poisson'],
              correctOptionIndex: 1,
              explanation: 'The CLT states that the sum or average of independent, identically distributed random variables tends toward a normal distribution.'
            },
            {
              questionText: 'What is the covariance between two independent random variables X and Y?',
              options: ['1', '0', '-1', 'Infinity'],
              correctOptionIndex: 1,
              explanation: 'Because independent variables share no linear relationship, Cov(X, Y) = E[XY] - E[X]E[Y] = 0.'
            }
          ]
        }
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 2. DATA STRUCTURES (DS)
  // -------------------------------------------------------------------------
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
        keyConcepts: ['Data Structures', 'Primitive vs Non-Primitive', 'Big-O Notation', 'Linear vs Non-Linear'],
        content: `A data structure is a specialized format for organizing, processing, retrieving, and storing data in computer memory.
Data structures are broadly divided into:
1. Primitive: Basic language types such as integer, float, character, and boolean.
2. Non-Primitive: Complex collections including arrays, linked lists, stacks, queues, trees, and graphs.
Non-primitive structures can be linear (elements arranged sequentially) or non-linear (hierarchical or interconnected graphs).
Algorithm efficiency is measured using Asymptotic Notation (Big-O for worst case, Omega for best case, Theta for average case).`,
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
        keyConcepts: ['Stack', 'Queue', 'LIFO', 'FIFO', 'Circular Queue', 'Infix to Postfix'],
        content: `Stacks and queues are fundamental linear data structures with constrained access patterns.
A Stack operates under LIFO (Last In, First Out). Core operations are Push (add item to top), Pop (remove item from top), and Peek (examine top element). Stacks power function call stacks, parenthesis matching, and undo mechanisms.
A Queue operates under FIFO (First In, First Out). Items enter at the rear (Enqueue) and exit at the front (Dequeue).
A Circular Queue overcomes empty-slot wastage in fixed arrays by wrapping pointers using modulo arithmetic.`,
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
        keyConcepts: ['Linked List', 'Singly Linked List', 'Doubly Linked List', 'Circular Linked List', 'Pointers'],
        content: `A Linked List is a linear data structure whose elements are not stored at contiguous memory locations.
Instead, each node contains two components:
1. Data: The value stored in the node.
2. Next: A pointer or reference storing the memory address of the next node.
Variants include:
- Singly Linked List: Forward navigation only.
- Doubly Linked List (DLL): Bidirectional navigation with next and previous pointers.
- Circular Linked List: The last node points back to the head node.
Linked lists provide O(1) insertion and deletion at the head, but require O(n) sequential traversal to access an arbitrary element by index.`,
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

  // -------------------------------------------------------------------------
  // 3. SOFTWARE ENGINEERING (SE)
  // -------------------------------------------------------------------------
  {
    code: 'SE',
    title: 'Software Engineering',
    slug: 'software-engineering',
    durationHours: 2.0,
    lessonCount: 2,
    image: '/images/SE.png',
    description: 'Software development lifecycle, Agile methodologies, requirements engineering, architectural design patterns, software testing, and CI/CD pipelines.',
    order: 3,
    category: 'Master of Computer Applications',
    modules: [
      {
        moduleNumber: 1,
        title: 'Agile Methodologies & Scrum Framework',
        slug: 'agile-methodologies-and-scrum-framework',
        summary: 'Explore Agile manifesto values, Scrum ceremonies (Sprint Planning, Daily Standup, Review, Retrospective), roles, and backlog management.',
        estimatedMinutes: 40,
        pdfUrl: '/materials/Agile.pdf',
        keyConcepts: ['Agile', 'Scrum', 'Sprint', 'User Stories', 'Product Backlog', 'Velocity'],
        content: `Agile software engineering values working software, customer collaboration, responding to change, and individuals and interactions over rigid processes.
The Scrum Framework organizes engineering teams around time-boxed iterations called Sprints (typically 1 to 4 weeks).
Key Roles:
- Product Owner: Holds the vision of the product, manages and prioritizes the Product Backlog.
- Scrum Master: Facilitates ceremonies, removes team impediments, and coaches the team in Scrum practices.
- Developers: Cross-functional professionals who build the increment.
Key Ceremonies include Sprint Planning, Daily Scrum, Sprint Review, and Sprint Retrospective.`,
        topics: [
          {
            topicNumber: 1,
            title: 'Agile Methodologies & Scrum Framework',
            estimatedMinutes: 40,
            pdfUrl: '/materials/Agile.pdf'
          }
        ],
        quiz: {
          title: 'Agile Methodologies & Scrum Framework Assessment',
          questions: [
            {
              questionText: 'Which of the following is one of the four core values of the Agile Manifesto?',
              options: [
                'Comprehensive documentation over working software',
                'Responding to change over following a plan',
                'Contract negotiation over customer collaboration',
                'Processes and tools over individuals and interactions'
              ],
              correctOptionIndex: 1,
              explanation: 'The Agile Manifesto values "Responding to change over following a plan".'
            },
            {
              questionText: 'In the Scrum framework, who is solely accountable for prioritizing the Product Backlog?',
              options: ['The Scrum Master', 'The Lead Architect', 'The Product Owner', 'The Quality Assurance Lead'],
              correctOptionIndex: 2,
              explanation: 'The Product Owner is solely accountable for maximizing product value and ordering items in the Product Backlog.'
            },
            {
              questionText: 'What is the recommended time-box for the Daily Scrum (Daily Standup) meeting?',
              options: ['15 minutes', '45 minutes', '1 hour', '5 minutes'],
              correctOptionIndex: 0,
              explanation: 'The Daily Scrum is strictly time-boxed to 15 minutes to inspect progress toward the Sprint Goal and plan the next 24 hours.'
            },
            {
              questionText: 'What artifact represents the team velocity and remaining work across sprint days?',
              options: ['Gantt Chart', 'Burn-Down Chart', 'Fishbone Diagram', 'Entity-Relationship Diagram'],
              correctOptionIndex: 1,
              explanation: 'A Sprint Burn-Down Chart plots remaining estimated hours or story points against sprint days to track completion velocity.'
            },
            {
              questionText: 'During which Scrum ceremony does the team inspect how the sprint went regarding individuals, interactions, and tools?',
              options: ['Sprint Planning', 'Sprint Review', 'Sprint Retrospective', 'Backlog Refinement'],
              correctOptionIndex: 2,
              explanation: 'The Sprint Retrospective occurs at the end of every sprint to evaluate team dynamics, processes, and continuous improvements.'
            },
            {
              questionText: 'What does the INVEST mnemonic stand for in writing effective User Stories?',
              options: [
                'Independent, Negotiable, Valuable, Estimable, Small, Testable',
                'Integrated, Networked, Validated, Executable, Standard, Timed',
                'Incremental, Normalized, Verified, Efficient, Structured, Tracked',
                'Iterative, Numeric, Variable, Exact, Synchronized, Tested'
              ],
              correctOptionIndex: 0,
              explanation: 'INVEST guidelines remind teams that user stories should be Independent, Negotiable, Valuable, Estimable, Small, and Testable.'
            },
            {
              questionText: 'What constitutes the "Definition of Done" (DoD) in Scrum?',
              options: [
                'The developer saying the code runs on their local machine',
                'A formal checklist of quality criteria that an increment must meet to be considered releasable',
                'Approval by the company board of directors',
                'When the sprint deadline has passed, regardless of bugs'
              ],
              correctOptionIndex: 1,
              explanation: 'The Definition of Done is an agreed-upon standard ensuring an increment meets required unit tests, code review, documentation, and quality gates.'
            },
            {
              questionText: 'What is the role of the Scrum Master during daily engineering activities?',
              options: [
                'Assigning daily tasks to engineers and demanding reports',
                'Acting as a servant leader who eliminates blockers and coaches team agility',
                'Writing all production code and deploying to production',
                'Deciding product pricing and market strategy'
              ],
              correctOptionIndex: 1,
              explanation: 'The Scrum Master is a servant leader who facilitates meetings, clears impediments, and protects the team from external distractions.'
            },
            {
              questionText: 'What does "Velocity" represent in Agile project tracking?',
              options: [
                'The network bandwidth of continuous integration servers',
                'The amount of work (usually in story points) completed by a team during a sprint',
                'The typing speed of developers',
                'The turnaround time of bug fix requests'
              ],
              correctOptionIndex: 1,
              explanation: 'Velocity measures the average amount of story points an Agile team turns into completed increments per sprint.'
            },
            {
              questionText: 'How is a Sprint Goal altered once a Sprint has already commenced?',
              options: [
                'Any developer can modify the goal whenever they wish',
                'The goal cannot be altered during the sprint; if obsolete, only the Product Owner can cancel the sprint',
                'The client modifies it by emailing the development team directly',
                'The goal changes automatically every 24 hours'
              ],
              correctOptionIndex: 1,
              explanation: 'In Scrum, no changes are made that would endanger the Sprint Goal; if the goal becomes completely obsolete, only the Product Owner may cancel the sprint.'
            }
          ]
        }
      },
      {
        moduleNumber: 2,
        title: 'Software Engineering & Architectural Principles',
        slug: 'software-engineering-and-architectural-principles',
        summary: 'Master software architecture patterns (Layered, MVC, Microservices), SOLID principles, coupling, cohesion, and testing methodologies.',
        estimatedMinutes: 45,
        pdfUrl: '/materials/seap1.pdf',
        keyConcepts: ['Software Architecture', 'SOLID Principles', 'MVC', 'High Cohesion', 'Low Coupling', 'Testing'],
        content: `Software engineering encompasses structured engineering methods to create reliable, maintainable software systems.
Key architectural patterns:
1. Layered (N-Tier) Architecture: Separating presentation, business logic, and data persistence.
2. MVC (Model-View-Controller): Decoupling business entities, user interface templates, and input routing.
3. Microservices: Independently deployable distributed services communicating via lightweight protocols.
SOLID Principles:
- Single Responsibility: A class should have only one reason to change.
- Open-Closed: Open for extension, closed for modification.
- Liskov Substitution: Subtypes must be substitutable for base types.
- Interface Segregation: Client-specific interfaces are better than general-purpose ones.
- Dependency Inversion: Depend on abstractions, not concretions.`,
        topics: [
          {
            topicNumber: 1,
            title: 'Software Engineering & Architectural Principles',
            estimatedMinutes: 45,
            pdfUrl: '/materials/seap1.pdf'
          }
        ],
        quiz: {
          title: 'Software Engineering & Architectural Principles Assessment',
          questions: [
            {
              questionText: 'What does the "S" in the SOLID design principles stand for?',
              options: [
                'Systematic Integration Principle',
                'Single Responsibility Principle',
                'Subclass Extensibility Principle',
                'Stateless Architecture Principle'
              ],
              correctOptionIndex: 1,
              explanation: 'The Single Responsibility Principle (SRP) dictates that a module or class should have only one reason to change.'
            },
            {
              questionText: 'In the MVC design pattern, what is the role of the Controller?',
              options: [
                'To render HTML styles and presentation elements',
                'To intercept user requests, invoke business logic, and select the appropriate view response',
                'To establish physical database socket connections',
                'To generate SQL table schemas'
              ],
              correctOptionIndex: 1,
              explanation: 'The Controller acts as the mediator between Model and View, handling incoming HTTP requests, orchestrating business models, and rendering views.'
            },
            {
              questionText: 'Which software engineering design goal describes high modularity?',
              options: [
                'High Coupling and Low Cohesion',
                'High Cohesion and Low (Loose) Coupling',
                'No Cohesion and High Coupling',
                'Monolithic centralization'
              ],
              correctOptionIndex: 1,
              explanation: 'High cohesion ensures modules focus on closely related tasks, while loose coupling minimizes interdependencies between distinct modules.'
            },
            {
              questionText: 'What does the Open/Closed Principle (OCP) state?',
              options: [
                'Source code files must be opened for read and closed for write',
                'Software entities should be open for extension, but closed for modification',
                'Database ports should remain open only during business hours',
                'All APIs must be public open-source'
              ],
              correctOptionIndex: 1,
              explanation: 'OCP states that systems should be designed so new functionality can be added through subclassing or interfaces without editing existing tested code.'
            },
            {
              questionText: 'What is the purpose of Regression Testing in software engineering?',
              options: [
                'To verify that recent code changes or bug fixes have not adversely affected existing functional features',
                'To calculate the linear regression formula for sales forecasts',
                'To test the system solely under extreme network traffic load',
                'To check the syntax of code before compiling'
              ],
              correctOptionIndex: 0,
              explanation: 'Regression testing re-runs test suites to ensure modifications have not broken previously functional parts of the software.'
            },
            {
              questionText: 'What distinguishes Black-Box testing from White-Box testing?',
              options: [
                'Black-box testing evaluates system behavior against specifications without knowledge of internal code logic',
                'Black-box testing is performed only on Linux terminal servers',
                'White-box testing is performed by business stakeholders without looking at code',
                'Black-box testing requires full access to compiler AST trees'
              ],
              correctOptionIndex: 0,
              explanation: 'Black-box testing focuses solely on inputs and expected outputs, whereas White-box testing examines internal code paths, branches, and structures.'
            },
            {
              questionText: 'What does the Dependency Inversion Principle (DIP) mandate?',
              options: [
                'High-level modules should not depend on low-level modules; both should depend on abstractions',
                'Database tables must have foreign keys inverted',
                'Frontend web apps should never make backend API calls',
                'Dependencies should be hard-coded inside constructor methods'
              ],
              correctOptionIndex: 0,
              explanation: 'DIP decouples modules by mandating that high-level policies depend on abstract interfaces rather than concrete implementations.'
            },
            {
              questionText: 'What is Cyclomatic Complexity in software quality analysis?',
              options: [
                'The number of CPU cycles consumed per function call',
                'A metric that measures the number of linearly independent execution paths through source code',
                'The count of external npm packages installed in package.json',
                'The number of classes in an inheritance hierarchy'
              ],
              correctOptionIndex: 1,
              explanation: 'Thomas McCabe\'s Cyclomatic Complexity quantifies decision logic complexity: M = E - N + 2P, indicating how difficult code is to test and maintain.'
            },
            {
              questionText: 'In software architecture, what is a Microservices Architecture pattern?',
              options: [
                'Writing code that fits in fewer than 100 bytes',
                'An architecture that structures an application as a collection of independently deployable, loosely coupled services',
                'A single monolithic executable that runs on a micro-controller',
                'A frontend library that renders miniature UI buttons'
              ],
              correctOptionIndex: 1,
              explanation: 'Microservices architecture organizes an application as small, autonomous services centered around specific business capabilities.'
            },
            {
              questionText: 'What is Continuous Integration (CI) in a DevOps pipeline?',
              options: [
                'Continuously running production servers without ever rebooting',
                'The practice of frequently merging code commits into a central repository, followed by automated builds and automated testing',
                'Manual copy-pasting of files to FTP servers at the end of every quarter',
                'Requiring developers to work uninterrupted 24/7'
              ],
              correctOptionIndex: 1,
              explanation: 'Continuous Integration automates compiling, linting, and running test suites upon every code push to detect integration defects early.'
            }
          ]
        }
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 4. OPERATING SYSTEM (OS)
  // -------------------------------------------------------------------------
  {
    code: 'OS',
    title: 'Operating System',
    slug: 'operating-system',
    durationHours: 2.0,
    lessonCount: 2,
    image: '/images/OS.png',
    description: 'Process management, thread scheduling, CPU scheduling algorithms, memory management, virtual memory, paging, deadlocks, file systems, and I/O systems.',
    order: 4,
    category: 'Master of Computer Applications',
    modules: [
      {
        moduleNumber: 1,
        title: 'Process Management & CPU Scheduling',
        slug: 'process-management-and-cpu-scheduling',
        summary: 'Understand process concepts, Process Control Blocks (PCB), context switching, state transitions, and CPU scheduling algorithms (FCFS, SJF, Round Robin, Priority).',
        estimatedMinutes: 45,
        pdfUrl: '/materials/Process_Management.pdf',
        keyConcepts: ['Process Management', 'PCB', 'Context Switching', 'Round Robin', 'SJF', 'FCFS'],
        content: `A process is a program in execution. Its address space comprises the Text (code), Data (global variables), Heap (dynamically allocated memory), and Stack (local variables and function frames).
The Process Control Block (PCB) holds vital metadata: Process ID (PID), Process State, Program Counter, CPU registers, memory limits, and list of open files.
States: New -> Ready -> Running -> Waiting (Blocked) -> Terminated.
CPU Scheduling:
- First-Come, First-Served (FCFS): Non-preemptive, suffers from Convoy Effect.
- Shortest Job First (SJF): Optimal average waiting time, but susceptible to starvation.
- Round Robin (RR): Preemptive, utilizes a fixed time quantum (q) for fairness.`,
        topics: [
          {
            topicNumber: 1,
            title: 'Process Management & CPU Scheduling',
            estimatedMinutes: 45,
            pdfUrl: '/materials/Process_Management.pdf'
          }
        ],
        quiz: {
          title: 'Process Management & CPU Scheduling Assessment',
          questions: [
            {
              questionText: 'What data structure is used by the operating system kernel to maintain all information about an active process?',
              options: [
                'File Allocation Table (FAT)',
                'Process Control Block (PCB)',
                'Virtual Memory Directory',
                'Interrupt Vector Table'
              ],
              correctOptionIndex: 1,
              explanation: 'The PCB (Process Control Block) contains PID, process state, program counter, register values, and scheduling info.'
            },
            {
              questionText: 'What occurs during a Context Switch between two processes?',
              options: [
                'The CPU changes its clock frequency and cooling fan speed',
                'The state/registers of the active process are saved in its PCB, and the state of the scheduled process is restored',
                'All user processes are terminated and the machine reboots',
                'Hard drive partitions are remounted'
              ],
              correctOptionIndex: 1,
              explanation: 'Context switching saves the current execution context of a running process and restores another, incurring pure computational overhead.'
            },
            {
              questionText: 'What is the "Convoy Effect" commonly observed in FCFS (First-Come, First-Served) scheduling?',
              options: [
                'Processes completing in reverse alphabetical order',
                'Short CPU-burst processes being forced to wait behind a long, heavy CPU-bound process',
                'All I/O devices running at 100% saturation simultaneously',
                'Multiple processes executing simultaneously on a single-core CPU'
              ],
              correctOptionIndex: 1,
              explanation: 'In FCFS, if a large CPU-bound process monopolizes the processor, shorter I/O-bound processes back up in the ready queue, lowering device utilization.'
            },
            {
              questionText: 'In Round Robin (RR) scheduling, what happens if the time quantum is set extremely large?',
              options: [
                'Round Robin degenerates into First-Come First-Served (FCFS) behavior',
                'Context switch frequency increases toward infinity',
                'Processes are terminated for taking too long',
                'All processes achieve zero waiting time'
              ],
              correctOptionIndex: 0,
              explanation: 'If the time quantum exceeds the longest CPU burst of any process, each process finishes without preemption, mimicking FCFS.'
            },
            {
              questionText: 'Which process state transition occurs when a running process issues an I/O request (e.g., reading a disk file)?',
              options: [
                'Running to Ready',
                'Running to Waiting (Blocked)',
                'Waiting to Terminated',
                'Ready to New'
              ],
              correctOptionIndex: 1,
              explanation: 'A process that requests an I/O operation cannot execute further on the CPU until the I/O completes, so it transitions to Waiting.'
            },
            {
              questionText: 'Which CPU scheduling algorithm provably produces the minimum average waiting time for a given set of stationary processes?',
              options: [
                'First-Come First-Served (FCFS)',
                'Shortest Job First (SJF) / Shortest Remaining Time First (SRTF)',
                'Priority Scheduling without aging',
                'Round Robin with large quantum'
              ],
              correctOptionIndex: 1,
              explanation: 'By scheduling the shortest CPU bursts first, SJF/SRTF minimizes queue delay for subsequent jobs, minimizing average waiting time.'
            },
            {
              questionText: 'What technique solves the problem of "Starvation" in priority-based CPU scheduling?',
              options: [
                'Paging',
                'Aging (gradually increasing the priority of processes waiting in the queue)',
                'Thrashing',
                'Busy Waiting'
              ],
              correctOptionIndex: 1,
              explanation: 'Aging gradually boosts the priority of long-waiting low-priority processes over time, ensuring they eventually run.'
            },
            {
              questionText: 'What is the critical section problem in multi-process synchronization?',
              options: [
                'A segment of code that accesses shared resources that must not be concurrently executed by more than one process',
                'A hardware sector on a hard drive that cannot be read',
                'The portion of kernel boot code that configures RAM',
                'A network socket that has timed out'
              ],
              correctOptionIndex: 0,
              explanation: 'A critical section contains shared mutable data; mutual exclusion must be enforced to avoid race conditions.'
            },
            {
              questionText: 'Which of the following is NOT one of the four Coffman conditions necessary for Deadlock to occur?',
              options: [
                'Mutual Exclusion',
                'Hold and Wait',
                'No Preemption',
                'Preemptive Priority Inversion'
              ],
              correctOptionIndex: 3,
              explanation: 'The four necessary Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.'
            },
            {
              questionText: 'What is a "Zombie Process" in Unix-like operating systems?',
              options: [
                'A process that has finished execution but still has an entry in the process table because its parent has not read its exit status',
                'A malicious Trojan process taking over memory',
                'A process whose priority fluctuates randomly',
                'A background thread that runs indefinitely'
              ],
              correctOptionIndex: 0,
              explanation: 'When a child terminates, its entry remains in the process table with exit code until the parent calls wait() to reap it.'
            }
          ]
        }
      },
      {
        moduleNumber: 2,
        title: 'Paging and Memory Segmentation',
        slug: 'paging-and-memory-segmentation',
        summary: 'Master virtual memory architecture, logical-to-physical address translation, page tables, TLBs, internal vs external fragmentation, and segmentation.',
        estimatedMinutes: 40,
        pdfUrl: '/materials/Paging_and_Segmentation.pdf',
        keyConcepts: ['Virtual Memory', 'Paging', 'Page Table', 'TLB', 'Segmentation', 'Fragmentation'],
        content: `Virtual memory separates user logical memory from physical memory, allowing the execution of processes that are not completely in physical memory.
Paging:
- Physical memory is divided into fixed-sized blocks called Frames.
- Logical memory is divided into blocks of the same size called Pages.
The CPU generates a logical address containing a Page Number (p) and a Page Offset (d).
The Memory Management Unit (MMU) uses the Page Table to map page p to frame f, yielding physical address (f * frame_size + d).
A Translation Lookaside Buffer (TLB) is an associative hardware cache that speeds up address translation.
Paging eliminates external fragmentation but can lead to internal fragmentation in the last allocated page.
Segmentation organizes memory into variable-sized logical units (Code, Stack, Heap, Symbol Table).`,
        topics: [
          {
            topicNumber: 1,
            title: 'Paging and Memory Segmentation',
            estimatedMinutes: 40,
            pdfUrl: '/materials/Paging_and_Segmentation.pdf'
          }
        ],
        quiz: {
          title: 'Paging and Memory Segmentation Assessment',
          questions: [
            {
              questionText: 'How is physical memory divided in a Paging memory management scheme?',
              options: [
                'Variable-sized blocks called segments',
                'Fixed-sized blocks called Frames',
                'Dynamic sectors called clusters',
                'Continuous heaps'
              ],
              correctOptionIndex: 1,
              explanation: 'In paging, physical memory is partitioned into fixed-sized chunks called frames, while logical memory is split into pages of identical size.'
            },
            {
              questionText: 'What hardware component performs the translation of logical addresses into physical RAM addresses at runtime?',
              options: ['Direct Memory Access (DMA) controller', 'Memory Management Unit (MMU)', 'Arithmetic Logic Unit (ALU)', 'Instruction Register'],
              correctOptionIndex: 1,
              explanation: 'The MMU (Memory Management Unit) is the hardware device that maps logical addresses to physical addresses at runtime.'
            },
            {
              questionText: 'What type of memory fragmentation is inherent in Paging systems?',
              options: [
                'External Fragmentation only',
                'Internal Fragmentation (within the final allocated page of a process)',
                'No fragmentation can ever occur',
                'Segment table fragmentation'
              ],
              correctOptionIndex: 1,
              explanation: 'Because memory is allocated in fixed page chunks, if a process requires 1 byte more than a page, a full page is allocated, causing internal fragmentation.'
            },
            {
              questionText: 'What is the role of the Translation Lookaside Buffer (TLB)?',
              options: [
                'To buffer output text for printer drivers',
                'A high-speed associative hardware cache that stores recent page-to-frame translations to avoid extra memory lookups',
                'To monitor hard disk bad sectors',
                'To convert C++ code to bytecode'
              ],
              correctOptionIndex: 1,
              explanation: 'The TLB caches recent page-to-frame mappings; a TLB hit allows instant translation without reading the page table from RAM.'
            },
            {
              questionText: 'What happens when a CPU attempts to access a page marked invalid in the page table (not resident in physical RAM)?',
              options: [
                'Hardware system crash and blue screen',
                'A Page Fault trap is generated, prompting the OS to fetch the page from swap disk',
                'The CPU executes the next instruction ignoring the missing data',
                'The process priority is permanently reduced to zero'
              ],
              correctOptionIndex: 1,
              explanation: 'A page fault trap invokes the OS pager, which allocates a free frame, reads the page from backing store, updates the page table, and restarts the instruction.'
            },
            {
              questionText: 'If a logical address space has a page size of 4 KB (2^12 bytes), how many bits are used for the Page Offset (d)?',
              options: ['8 bits', '12 bits', '16 bits', '32 bits'],
              correctOptionIndex: 1,
              explanation: 'Page offset size = log2(page_size). For 4 KB = 4096 = 2^12 bytes, exactly 12 bits are required for the offset.'
            },
            {
              questionText: 'What characterizes Segmentation in contrast to Paging?',
              options: [
                'Memory is split into fixed-size 64 KB blocks',
                'Memory is divided into variable-length logical segments reflecting the user\'s view of program modules (e.g., code, stack, data)',
                'Segmentation requires zero hardware support',
                'Segmentation only functions on 16-bit processors'
              ],
              correctOptionIndex: 1,
              explanation: 'Segmentation supports the programmer\'s view of memory as variable-sized segments (functions, arrays, stack) rather than arbitrary fixed chunks.'
            },
            {
              questionText: 'What is "Thrashing" in a virtual memory system?',
              options: [
                'The rapid fragmentation of a magnetic hard drive',
                'A state where the operating system spends more time swapping pages in and out than executing instructions',
                'Clearing RAM cache when shutting down',
                'Overclocking the GPU memory bus'
              ],
              correctOptionIndex: 1,
              explanation: 'Thrashing occurs when total working set sizes exceed physical memory, causing continuous page faults and near-zero CPU throughput.'
            },
            {
              questionText: 'Which page replacement algorithm replaces the page that will not be used for the longest period of time in the future?',
              options: [
                'FIFO (First-In, First-Out)',
                'Optimal Page Replacement (OPT / Belady\'s Algorithm)',
                'LRU (Least Recently Used)',
                'Second-Chance (Clock) Algorithm'
              ],
              correctOptionIndex: 1,
              explanation: 'Belady\'s OPT algorithm looks forward in time and replaces the page unreferenced for the longest duration, serving as the theoretical optimal benchmark.'
            },
            {
              questionText: 'What is Belady\'s Anomaly in page replacement algorithms?',
              options: [
                'A condition where increasing the number of page frames results in an increased number of page faults (e.g., in FIFO)',
                'A deadlock caused by two processes sharing one page table',
                'Memory leaking when closing an application',
                'A hardware fault where bits flip inside dynamic RAM'
              ],
              correctOptionIndex: 0,
              explanation: 'Belady\'s Anomaly describes the counter-intuitive phenomenon where allocating more page frames increases page faults under FIFO.'
            }
          ]
        }
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 5. DATABASE MANAGEMENT SYSTEMS (DBMS)
  // -------------------------------------------------------------------------
  {
    code: 'DBMS',
    title: 'DBMS',
    slug: 'dbms',
    durationHours: 2.5,
    lessonCount: 3,
    image: '/images/DBMS.png',
    description: 'Relational database design, normalization (1NF through BCNF), indexing, transactions, ACID properties, concurrency control, and SQL optimization.',
    order: 5,
    category: 'Master of Computer Applications',
    modules: [
      {
        moduleNumber: 1,
        title: 'ER Model & Conceptual Database Design',
        slug: 'er-model-and-conceptual-database-design',
        summary: 'Explore Entity-Relationship modeling, strong vs weak entities, cardinalities, composite/multivalued attributes, and ER-to-relational schema mapping.',
        estimatedMinutes: 40,
        pdfUrl: '/materials/ER Model Conceptual Design.pptx',
        keyConcepts: ['ER Model', 'Entities', 'Attributes', 'Cardinality', 'Weak Entity', 'Schema Mapping'],
        content: `Conceptual database design structures requirements into an Entity-Relationship (ER) model.
Components:
1. Entity: A real-world object distinguishable from other objects (e.g., Student, Course).
2. Attributes: Properties of entities (Simple, Composite, Single-valued, Multivalued, Derived).
3. Relationships: Associations among entities with Cardinality Ratios (1:1, 1:N, N:M) and Participation constraints (Total vs Partial).
4. Weak Entity Set: An entity that does not possess a primary key of its own and depends on an identifying owner entity via a discriminator (partial key).
Conversion to Relational Tables:
- 1:N relationships map the primary key of the '1' side as a foreign key in the 'N' side table.
- M:N relationships require a separate junction table holding foreign keys of both participating entities.`,
        topics: [
          {
            topicNumber: 1,
            title: 'ER Model & Conceptual Database Design',
            estimatedMinutes: 40,
            pdfUrl: '/materials/ER Model Conceptual Design.pptx'
          }
        ],
        quiz: {
          title: 'ER Model & Conceptual Database Design Assessment',
          questions: [
            {
              questionText: 'What defines a Weak Entity Set in an Entity-Relationship (ER) diagram?',
              options: [
                'An entity set with fewer than three attributes',
                'An entity set that does not have a primary key and depends on an identifying owner entity',
                'An entity set stored in temporary cache memory',
                'An entity set that does not allow foreign key references'
              ],
              correctOptionIndex: 1,
              explanation: 'A weak entity set lacks sufficient key attributes to form a primary key on its own and requires an identifying relationship with an owner entity.'
            },
            {
              questionText: 'How is a Weak Entity Set represented visually in standard Chen ER notation?',
              options: [
                'A single dashed rectangle',
                'A double rectangle',
                'A diamond inside a circle',
                'An inverted triangle'
              ],
              correctOptionIndex: 1,
              explanation: 'In Chen ER notation, weak entity sets are enclosed in double rectangles, and identifying relationship sets in double diamonds.'
            },
            {
              questionText: 'What kind of attribute can be divided into smaller sub-parts (e.g., Name into First_Name, Last_Name)?',
              options: ['Multivalued Attribute', 'Composite Attribute', 'Derived Attribute', 'Discriminator Attribute'],
              correctOptionIndex: 1,
              explanation: 'A composite attribute can be split into smaller sub-components that have independent meanings of their own.'
            },
            {
              questionText: 'How is a Multivalued Attribute (e.g., Phone_Numbers) mapped into relational database tables?',
              options: [
                'Stored as a comma-separated string in the primary table',
                'A new separate relation (table) is created containing the primary key of the entity and the multivalued attribute',
                'Dropped from the database schema entirely',
                'Converted into a foreign key pointing to the schema catalog'
              ],
              correctOptionIndex: 1,
              explanation: 'To satisfy 1NF, multivalued attributes are extracted into a separate table paired with the parent entity\'s primary key.'
            },
            {
              questionText: 'When mapping a Many-to-Many (M:N) relationship into a relational schema, what is required?',
              options: [
                'Adding an array column to one of the tables',
                'Creating a new junction/relationship table containing primary keys from both entity sets as foreign keys',
                'Merging both entity sets into a single table with duplicate rows',
                'M:N relationships cannot be represented in relational databases'
              ],
              correctOptionIndex: 1,
              explanation: 'An M:N relationship requires a bridge (junction) table containing foreign keys referencing both participating entities, forming a composite primary key.'
            },
            {
              questionText: 'What does a double line between an entity set and a relationship set represent in an ER diagram?',
              options: [
                'Partial Participation',
                'Total Participation (every entity in the set must participate in the relationship)',
                'A recursive self-join',
                'A read-only constraint'
              ],
              correctOptionIndex: 1,
              explanation: 'Total participation (or existence dependency) is signified by a double line, indicating every entity instance must participate in the relationship.'
            },
            {
              questionText: 'What is a Derived Attribute in database modeling?',
              options: [
                'An attribute whose value is computed or calculated from another stored attribute (e.g., Age derived from Date_of_Birth)',
                'An attribute inherited from an external database server',
                'A primary key auto-incremented by the database engine',
                'An attribute that cannot be null'
              ],
              correctOptionIndex: 0,
              explanation: 'Derived attributes (drawn as dashed ovals in ER diagrams) are dynamically calculated from existing stored data.'
            },
            {
              questionText: 'What is the Discriminator (or partial key) of a weak entity set?',
              options: [
                'The primary key of the parent entity',
                'A set of attributes that distinguishes weak entity instances that belong to the same parent entity',
                'The database system index column',
                'A flag indicating whether a record is deleted'
              ],
              correctOptionIndex: 1,
              explanation: 'The discriminator (indicated by a dashed underline) differentiates weak entities related to the same owner entity.'
            },
            {
              questionText: 'How is a One-to-Many (1:N) relationship typically implemented in a relational schema?',
              options: [
                'By placing the primary key of the "1" side table as a foreign key in the "N" side table',
                'By creating three separate junction tables',
                'By duplicating the entire table on both sides',
                'By forcing all attributes to be unique'
              ],
              correctOptionIndex: 0,
              explanation: 'In a 1:N relationship (e.g., Department to Employees), the primary key of the Department (1-side) is placed as a foreign key in Employee (N-side).'
            },
            {
              questionText: 'What is Cardinality Ratio in ER modeling?',
              options: [
                'The ratio of table disk space to index space',
                'The number of relationship instances in which an entity can participate (1:1, 1:N, N:M)',
                'The speed of executing a SELECT query',
                'The number of columns divided by the number of rows'
              ],
              correctOptionIndex: 1,
              explanation: 'Cardinality ratio specifies maximum constraints on the number of entities that can participate in a relationship.'
            }
          ]
        }
      },
      {
        moduleNumber: 2,
        title: 'Database Normalization (1NF to BCNF)',
        slug: 'database-normalization-1nf-to-bcnf',
        summary: 'Understand functional dependencies, data anomalies (insertion, deletion, update), and systematic decomposition into 1NF, 2NF, 3NF, and BCNF.',
        estimatedMinutes: 45,
        pdfUrl: '/materials/Database_Normalization.pptx',
        keyConcepts: ['Normalization', 'Functional Dependency', '1NF', '2NF', '3NF', 'BCNF', 'Anomalies'],
        content: `Normalization is the formal process of structuring relational database schemas to minimize redundancy and eliminate data anomalies.
Anomalies:
1. Insertion Anomaly: Inability to insert information without adding unrelated dummy data.
2. Deletion Anomaly: Loss of unintended data when deleting a record.
3. Update Anomaly: Inconsistent data when updating duplicate fields.
Normal Forms:
- 1NF: Every attribute value must be atomic (no multivalued or repeating groups).
- 2NF: Must be in 1NF and have NO partial dependencies (non-prime attributes must depend on the whole candidate key).
- 3NF: Must be in 2NF and have NO transitive dependencies (no non-prime attribute determines another non-prime attribute: X -> Y where X is superkey or Y is prime).
- BCNF: For every functional dependency X -> Y, X must be a superkey.`,
        topics: [
          {
            topicNumber: 1,
            title: 'Database Normalization (1NF to BCNF)',
            estimatedMinutes: 45,
            pdfUrl: '/materials/Database_Normalization.pptx'
          }
        ],
        quiz: {
          title: 'Database Normalization Assessment',
          questions: [
            {
              questionText: 'What fundamental requirement must a relation meet to be in First Normal Form (1NF)?',
              options: [
                'It must contain zero foreign keys',
                'All attribute values must be atomic (indivisible single values)',
                'All tables must have at least 1,000 rows',
                'Every column must be an integer data type'
              ],
              correctOptionIndex: 1,
              explanation: '1NF disallows non-atomic values, repeating groups, and multivalued attributes; each cell must hold a single value.'
            },
            {
              questionText: 'What type of dependency is eliminated when moving a schema from 1NF to Second Normal Form (2NF)?',
              options: [
                'Transitive dependency',
                'Partial dependency (where a non-prime attribute depends on only a part of a composite candidate key)',
                'Trivial functional dependency',
                'Multi-valued join dependency'
              ],
              correctOptionIndex: 1,
              explanation: '2NF mandates that every non-prime attribute must be fully functionally dependent on the entire primary key, eliminating partial dependencies.'
            },
            {
              questionText: 'What condition defines Third Normal Form (3NF) for any non-trivial functional dependency X -> Y?',
              options: [
                'X must be a candidate key, or Y must be a prime attribute',
                'X and Y must both be foreign keys',
                'Y must be an auto-increment column',
                'X must equal Y'
              ],
              correctOptionIndex: 0,
              explanation: 'For a dependency X -> Y in 3NF, either X is a superkey, or Y is a prime attribute (part of some candidate key), which eliminates transitive dependencies.'
            },
            {
              questionText: 'How is Boyce-Codd Normal Form (BCNF) stricter than 3NF?',
              options: [
                'BCNF allows no foreign keys',
                'For every non-trivial functional dependency X -> Y, X MUST be a superkey (no exceptions for prime Y)',
                'BCNF applies only to NoSQL databases',
                'BCNF requires all column names to be uppercase'
              ],
              correctOptionIndex: 1,
              explanation: 'BCNF removes 3NF\'s exception for prime attributes: in BCNF, the determinant X in X -> Y must strictly be a superkey.'
            },
            {
              questionText: 'What is an "Update Anomaly" in an unnormalized database?',
              options: [
                'When the server runs out of disk storage during an UPDATE statement',
                'When modifying data in one location results in data inconsistency because duplicate copies were not updated',
                'When an SQL syntax error aborts a query',
                'When auto-commit is turned off'
              ],
              correctOptionIndex: 1,
              explanation: 'Redundant data storage forces updates across multiple rows; failing to update every instance creates inconsistent, conflicting records.'
            },
            {
              questionText: 'What does a Lossless-Join Decomposition guarantee in database normalization?',
              options: [
                'The decomposed tables cannot be joined using SQL',
                'Rejoining the decomposed relations via natural join produces the exact original relation without spurious or missing rows',
                'Disk usage is reduced to 0 megabytes',
                'All queries execute in under 1 millisecond'
              ],
              correctOptionIndex: 1,
              explanation: 'A decomposition is lossless if R1 natural-joined with R2 yields the original relation R with zero spurious records (R1 intersect R2 -> R1 or R2).'
            },
            {
              questionText: 'What is a "Prime Attribute" in database theory?',
              options: [
                'An attribute whose values are prime numbers',
                'An attribute that is a member of at least one candidate key of the relation',
                'An attribute created by the database administrator',
                'The first column created in a table'
              ],
              correctOptionIndex: 1,
              explanation: 'Any attribute that forms part of any candidate key is termed a prime attribute; all other attributes are non-prime.'
            },
            {
              questionText: 'According to Armstrong\'s Axioms, what does the Transitivity Rule state?',
              options: [
                'If X -> Y and Y -> Z, then X -> Z',
                'If X -> Y, then XZ -> Y',
                'If X -> Y, then Y -> X',
                'If X -> Y and X -> Z, then X -> YZ'
              ],
              correctOptionIndex: 0,
              explanation: 'The transitivity inference rule states that if X functionally determines Y, and Y functionally determines Z, then X determines Z.'
            },
            {
              questionText: 'What is a Deletion Anomaly?',
              options: [
                'Accidentally deleting the DBMS installation binary',
                'The unintended loss of essential data when a record containing unrelated information is deleted',
                'Deleting a table that has active user sessions',
                'A database trigger refusing to fire'
              ],
              correctOptionIndex: 1,
              explanation: 'A deletion anomaly occurs when deleting one piece of data inadvertently wipes out completely unrelated data stored in the same row.'
            },
            {
              questionText: 'When can a 3NF decomposition preserve all functional dependencies while a BCNF decomposition cannot?',
              options: [
                'Whenever a relation has non-overlapping candidate keys',
                'When two or more overlapping candidate keys share dependencies that cannot be enforced across BCNF-decomposed tables',
                'When all attributes are strings',
                'BCNF always preserves all functional dependencies'
              ],
              correctOptionIndex: 1,
              explanation: 'While 3NF is guaranteed to achieve both lossless join and dependency preservation, BCNF cannot always preserve all functional dependencies.'
            }
          ]
        }
      },
      {
        moduleNumber: 3,
        title: 'Query Processing & Optimization',
        slug: 'query-processing-and-optimization',
        summary: 'Explore stages of query processing (parsing, optimization, execution), relational algebra equivalence, cost estimation, and join algorithms.',
        estimatedMinutes: 40,
        pdfUrl: '/materials/Query Processing.pdf',
        keyConcepts: ['Query Processing', 'Query Optimization', 'Relational Algebra', 'Cost Estimation', 'Join Algorithms'],
        content: `Query processing translates high-level SQL queries into an efficient low-level physical execution plan.
Stages:
1. Parsing & Translation: Validates SQL syntax, checks catalog schema, and builds a relational algebra query tree.
2. Query Optimization: Evaluates mathematically equivalent relational algebra expressions to select the lowest-cost execution plan based on disk I/O, CPU time, and memory.
Heuristics:
- Push Selection (sigma) and Projection (pi) operations as early down the tree as possible to minimize intermediate relation sizes.
Join Algorithms:
- Nested Loop Join: O(M * N) disk blocks for unindexed tables.
- Block Nested Loop Join: Reads outer relation in blocks to reduce I/O.
- Index Nested Loop Join: Uses B+ tree index on the inner relation.
- Merge Join: Requires sorted inputs, highly efficient O(M + N).
- Hash Join: Partitions relations using a hash function.`,
        topics: [
          {
            topicNumber: 1,
            title: 'Query Processing & Optimization',
            estimatedMinutes: 40,
            pdfUrl: '/materials/Query Processing.pdf'
          }
        ],
        quiz: {
          title: 'Query Processing & Optimization Assessment',
          questions: [
            {
              questionText: 'What are the three fundamental stages of query evaluation in a relational DBMS?',
              options: [
                'Compilation, Encryption, Decryption',
                'Parsing and Translation, Query Optimization, and Query Execution',
                'Insertion, Deletion, Normalization',
                'Indexing, Hashing, Compression'
              ],
              correctOptionIndex: 1,
              explanation: 'The DBMS parses the SQL into relational algebra, optimizes the expression using catalog statistics, and executes the physical query plan.'
            },
            {
              questionText: 'What is the primary heuristic rule applied in relational algebra query optimization?',
              options: [
                'Perform Cartesian cross-products first',
                'Perform Selection (sigma) and Projection (pi) operations as early as possible to minimize intermediate tuple sizes',
                'Sort all tables in descending order',
                'Avoid using any WHERE clauses'
              ],
              correctOptionIndex: 1,
              explanation: 'Pushing selections and projections down the query tree filters out unwanted rows and columns early, drastically reducing intermediate I/O.'
            },
            {
              questionText: 'What metric is predominantly used to estimate query execution plan costs in traditional DBMSs?',
              options: [
                'The number of disk block transfers (I/O operations) and disk seeks',
                'The number of characters in the SQL query string',
                'The power wattage consumed by the database server',
                'The baud rate of the network router'
              ],
              correctOptionIndex: 0,
              explanation: 'Because disk access is orders of magnitude slower than RAM, the cost optimizer focuses on minimizing disk block reads/writes and seeks.'
            },
            {
              questionText: 'What join algorithm requires both input relations to be ordered on the join attributes?',
              options: ['Nested-Loop Join', 'Sort-Merge Join', 'Simple Hash Join', 'Cartesian Product Scan'],
              correctOptionIndex: 1,
              explanation: 'Sort-Merge Join iterates through both relations in lockstep, requiring that both inputs be pre-sorted on the join keys.'
            },
            {
              questionText: 'How does a Hash Join process two large relations R and S?',
              options: [
                'It sorts both tables in alphabetical order',
                'It uses a hash function to partition both relations into matching buckets based on the join attribute',
                'It executes a full table scan for every single row in the database',
                'It compresses both tables into zip files'
              ],
              correctOptionIndex: 1,
              explanation: 'Hash Join hashes the join key of tuples into buckets; only tuples within matching buckets need to be compared.'
            },
            {
              questionText: 'What role does the Database Catalog (Data Dictionary) play in query optimization?',
              options: [
                'It stores user passwords in plain text',
                'It provides statistical metadata (e.g., number of tuples, block counts, index heights, value distributions) used for cost estimation',
                'It displays promotional banners on the admin dashboard',
                'It formats HTML web views'
              ],
              correctOptionIndex: 1,
              explanation: 'The query optimizer consults system catalog statistics (cardinalities, distinct value counts, histograms) to estimate plan costs.'
            },
            {
              questionText: 'What is a "Query Execution Plan"?',
              options: [
                'A scheduled calendar invite sent to developers',
                'An exact tree of physical operators (e.g., Index Scan, Hash Join, Sort) specifying how a query will be executed',
                'The source code of the SQL parser',
                'A backup file stored in tape storage'
              ],
              correctOptionIndex: 1,
              explanation: 'The execution plan is the physical recipe chosen by the optimizer detailing the exact algorithms, indexes, and join orders to retrieve the data.'
            },
            {
              questionText: 'What is an "Index Scan" compared to a "Full Table Scan"?',
              options: [
                'Index scan traverses a B+ Tree index to retrieve matching records directly rather than sequentially inspecting every block in the table',
                'Index scan reads every sector on the physical disk twice',
                'Index scan can only be used on primary keys with string types',
                'Index scan is always slower than reading all blocks sequentially'
              ],
              correctOptionIndex: 0,
              explanation: 'An index scan navigates index nodes to pinpoint matching row IDs, avoiding reading unneeded data blocks when selectivity is high.'
            },
            {
              questionText: 'In relational algebra, what does the selection operator sigma_{salary > 50000}(Employee) do?',
              options: [
                'Selects only the salary column from Employee',
                'Filters and returns tuples (rows) from Employee that satisfy the predicate salary > 50000',
                'Sorts the table by salary',
                'Deletes all employees earning less than 50,000'
              ],
              correctOptionIndex: 1,
              explanation: 'Sigma represents horizontal selection, returning rows that satisfy the specified logical condition.'
            },
            {
              questionText: 'What is "Materialization" in evaluating relational algebra query trees?',
              options: [
                'Writing the output of each intermediate relational operator to a temporary disk relation before passing it to the parent operator',
                'Encrypting the table with AES-256',
                'Converting SQL code into assembly language',
                'Allowing dirty reads without locks'
              ],
              correctOptionIndex: 0,
              explanation: 'Materialization computes one operation at a time and writes intermediate results to disk/RAM, contrasted with Pipelining which streams tuples directly.'
            }
          ]
        }
      }
    ]
  },

  // -------------------------------------------------------------------------
  // 6. WEB APPLICATION AND DEVELOPMENT (WAD)
  // -------------------------------------------------------------------------
  {
    code: 'WAD',
    title: 'Web Application and Development',
    slug: 'web-application-and-development',
    durationHours: 2.5,
    lessonCount: 2,
    image: '/images/WAD.png',
    description: 'Full-stack web engineering with Node.js, Express, MongoDB, RESTful API design, authentication, session security, and dynamic responsive user interfaces.',
    order: 6,
    category: 'Master of Computer Applications',
    modules: [
      {
        moduleNumber: 1,
        title: 'JavaScript Fundamentals & Modern ES6+',
        slug: 'javascript-fundamentals-and-modern-es6',
        summary: 'Master execution contexts, closures, prototypes, event loops, promises, async/await, arrow functions, and ES6+ modular architecture.',
        estimatedMinutes: 40,
        pdfUrl: '/materials/JavaScript_Basics.pdf',
        keyConcepts: ['JavaScript', 'Closures', 'Event Loop', 'Promises', 'Async/Await', 'ES6+'],
        content: `JavaScript is a single-threaded, non-blocking, asynchronous concurrent runtime powered by an event loop.
Core Mechanics:
1. Execution Context & Call Stack: Contains Variable Environment, Scope Chain, and 'this' binding.
2. Closures: A function remembers its lexical scope even when invoked outside that scope.
3. Asynchronous Concurrency: Call Stack -> Web APIs -> Callback Queue (Macrotasks) & Microtask Queue (Promises, queueMicrotask). Microtasks always take precedence before the next event loop tick.
4. Promises & Async/Await: Managing asynchronous workflows with pending, fulfilled, and rejected states.
5. ES6+ Modern Syntax: Destructuring, spread/rest operators, template literals, arrow functions, and classes.`,
        topics: [
          {
            topicNumber: 1,
            title: 'JavaScript Fundamentals & Modern ES6+',
            estimatedMinutes: 40,
            pdfUrl: '/materials/JavaScript_Basics.pdf'
          }
        ],
        quiz: {
          title: 'JavaScript Fundamentals & Modern ES6+ Assessment',
          questions: [
            {
              questionText: 'What is a Closure in JavaScript?',
              options: [
                'A function bundled together with references to its surrounding lexical environment',
                'A method that closes a database connection',
                'A keyword that terminates an infinite while loop',
                'A private class constructor in TypeScript'
              ],
              correctOptionIndex: 0,
              explanation: 'A closure gives an inner function access to its outer function\'s scope even after the outer function has returned.'
            },
            {
              questionText: 'How does the JavaScript Event Loop prioritize Microtasks versus Macrotasks (Task Queue)?',
              options: [
                'Macrotasks always execute first',
                'All microtasks in the microtask queue (e.g., Promise callbacks) are drained before the next macrotask is dequeued',
                'Tasks are executed purely based on their memory size',
                'The event loop runs microtasks only on worker threads'
              ],
              correctOptionIndex: 1,
              explanation: 'Microtasks (resolved Promises, process.nextTick, MutationObserver) have higher priority and drain completely before the next task begins.'
            },
            {
              questionText: 'What is the main difference between "var", "let", and "const" in modern JavaScript?',
              options: [
                'var is block-scoped, while let and const are function-scoped',
                'let and const are block-scoped and exist in a Temporal Dead Zone before declaration; var is function-scoped and hoisted',
                'const variables can be freely reassigned anywhere',
                'var does not exist in ES6'
              ],
              correctOptionIndex: 1,
              explanation: 'let and const respect block scope ({}) and cannot be accessed before declaration (TDZ), whereas var is hoisted with undefined.'
            },
            {
              questionText: 'What are the three mutually exclusive states of a JavaScript Promise?',
              options: [
                'Initiated, Processing, Complete',
                'Pending, Fulfilled, Rejected',
                'Open, Locked, Closed',
                'Draft, Published, Archived'
              ],
              correctOptionIndex: 1,
              explanation: 'A Promise starts in the Pending state, and settles into either Fulfilled (with a value) or Rejected (with a reason).'
            },
            {
              questionText: 'What does the "async" keyword in front of a function declaration signify?',
              options: [
                'The function executes in a background C++ thread',
                'The function automatically returns a Promise, allowing the use of "await" inside its body',
                'The function cannot take any parameters',
                'The function will run every 5 seconds'
              ],
              correctOptionIndex: 1,
              explanation: 'Marking a function as async guarantees it returns a Promise, wrapping non-promise return values automatically.'
            },
            {
              questionText: 'How do Arrow Functions handle the "this" keyword compared to standard function declarations?',
              options: [
                'Arrow functions bind "this" to the global window object always',
                'Arrow functions do not bind their own "this"; they lexically inherit "this" from the enclosing scope',
                'Arrow functions have a dynamic "this" that changes on every call',
                'Arrow functions throw a TypeError if "this" is referenced'
              ],
              correctOptionIndex: 1,
              explanation: 'Arrow functions retain the lexical "this" of the context in which they were defined, avoiding .bind(this) workarounds.'
            },
            {
              questionText: 'What does the Array.prototype.reduce() method do in JavaScript?',
              options: [
                'Reduces the length of an array by truncating elements',
                'Iterates through an array and executes a reducer callback, accumulating elements into a single output value',
                'Filters out null and undefined values',
                'Reverses the elements in-place'
              ],
              correctOptionIndex: 1,
              explanation: 'reduce() runs a callback on each element, passing the accumulated result from previous iterations to produce a single value.'
            },
            {
              questionText: 'What does the Object Destructuring assignment `const { title, duration } = course;` achieve?',
              options: [
                'Deletes title and duration from the course object',
                'Extracts properties "title" and "duration" from the course object into local variables of the same names',
                'Freezes the object preventing modifications',
                'Creates a shallow clone of the course object'
              ],
              correctOptionIndex: 1,
              explanation: 'Object destructuring provides a concise syntax to unpack properties from objects directly into distinct variables.'
            },
            {
              questionText: 'What does the strict equality operator (===) check in JavaScript?',
              options: [
                'Equality of values only, performing implicit type coercion if necessary',
                'Both value equality and type equality without performing type coercion',
                'Whether two objects have identical memory addresses',
                'Checks if variables are null or undefined'
              ],
              correctOptionIndex: 1,
              explanation: 'Triple equals (===) checks value and type strictly; unlike double equals (==), it never performs implicit type conversion.'
            },
            {
              questionText: 'What is the purpose of the Spread Operator (...) when applied to arrays or objects?',
              options: [
                'It expands an iterable (like an array or object) into individual elements or property assignments',
                'It encrypts string values',
                'It computes the mathematical standard deviation',
                'It catches unhandled runtime exceptions'
              ],
              correctOptionIndex: 0,
              explanation: 'The spread operator (...) spreads array items or object key-value pairs into new literals, facilitating shallow cloning and merging.'
            }
          ]
        }
      },
      {
        moduleNumber: 2,
        title: 'Full-Stack Web Development & Express Architecture',
        slug: 'full-stack-web-development-and-express-architecture',
        summary: 'Build scalable web apps using Express routing, middleware architecture, EJS templating, Mongoose models, session security, and RESTful principles.',
        estimatedMinutes: 50,
        pdfUrl: '/materials/WEB-DEVELOPMENT-LAB.pdf',
        keyConcepts: ['Node.js', 'Express.js', 'REST API', 'MVC Architecture', 'Session Auth', 'Mongoose'],
        content: `Full-stack web application development integrates client interfaces with server-side business logic and database persistence.
Express.js Architecture:
1. Middleware Pipeline: Functions with signature (req, res, next) executed sequentially for logging, body parsing, auth, and error handling.
2. MVC Pattern: Models (Mongoose schemas), Views (EJS templates), and Controllers (request handlers).
3. Session Security: State maintained via HTTP cookies storing session IDs, backed by persistent stores like MongoDB (connect-mongo).
4. RESTful API Design: Standard HTTP verbs (GET, POST, PUT, DELETE) mapping to CRUD operations with appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500).
5. Security Headers: Hardening Express with Helmet, bcrypt password hashing, and input validation to guard against injection.`,
        topics: [
          {
            topicNumber: 1,
            title: 'Full-Stack Web Development & Express Architecture',
            estimatedMinutes: 50,
            pdfUrl: '/materials/WEB-DEVELOPMENT-LAB.pdf'
          }
        ],
        quiz: {
          title: 'Full-Stack Web Development & Express Architecture Assessment',
          questions: [
            {
              questionText: 'What is Middleware in an Express.js web application?',
              options: [
                'A database driver that writes binary files to disk',
                'A function that has access to the request object (req), response object (res), and the next middleware function in the application’s request-response cycle',
                'A CSS stylesheet preprocessor',
                'A hardware firewall device'
              ],
              correctOptionIndex: 1,
              explanation: 'Express middleware functions execute during the lifecycle of an HTTP request, capable of modifying req/res, ending responses, or calling next().'
            },
            {
              questionText: 'What must a custom Express middleware call to pass control to the next handler in the stack?',
              options: ['return true;', 'next();', 'res.send();', 'process.exit();'],
              correctOptionIndex: 1,
              explanation: 'Invoking next() passes execution to the succeeding middleware; failing to call next() or send a response hangs the request.'
            },
            {
              questionText: 'What HTTP status code represents "Created" following a successful resource creation (e.g., POST request)?',
              options: ['200 OK', '201 Created', '204 No Content', '302 Found'],
              correctOptionIndex: 1,
              explanation: 'HTTP 201 Created indicates that the request has succeeded and led to the creation of a new resource.'
            },
            {
              questionText: 'What is the function of the "connect-mongo" package in an Express.js application?',
              options: [
                'It acts as an ORM for compiling SQL migrations',
                'It stores Express session data persistently in MongoDB collections rather than volatile default memory',
                'It encrypts passwords with SHA-256',
                'It manages Docker containers'
              ],
              correctOptionIndex: 1,
              explanation: 'connect-mongo provides a persistent session store so user login sessions survive server restarts and scale across processes.'
            },
            {
              questionText: 'Why should passwords NEVER be stored in plain text or with simple MD5 hashes in MongoDB?',
              options: [
                'MongoDB only supports numeric fields',
                'Plaintext and fast hashes are easily compromised via rainbow tables and brute force; salted slow hashes like bcrypt provide strong cryptographic resistance',
                'Plaintext passwords crash the Node.js event loop',
                'JSON cannot serialize strings with special characters'
              ],
              correctOptionIndex: 1,
              explanation: 'bcrypt incorporates cryptographic salts and configurable work factors (cost) to defend against dictionary and rainbow table attacks.'
            },
            {
              questionText: 'What does the "Helmet" middleware package provide for Express applications?',
              options: [
                'Real-time automated code refactoring',
                'Setting security-related HTTP response headers (e.g., Content-Security-Policy, X-Frame-Options, X-Content-Type-Options) to protect against common web attacks',
                'Automatic database backups',
                'GPU hardware acceleration'
              ],
              correctOptionIndex: 1,
              explanation: 'Helmet secures Express apps by configuring various HTTP response headers to mitigate XSS, clickjacking, and MIME-sniffing.'
            },
            {
              questionText: 'In Mongoose ODM, what does the "ref" property in a Schema definition establish?',
              options: [
                'A reference to another model for population across collections (similar to a foreign key relationship)',
                'A Git commit reference',
                'A reference to a CSS stylesheet',
                'A pointer to an in-memory Redis cache'
              ],
              correctOptionIndex: 0,
              explanation: 'In Mongoose, ref specifies the target model to link with an ObjectId, allowing automatic population with .populate().'
            },
            {
              questionText: 'What does the HTTP 401 Unauthorized status code specifically communicate to a client?',
              options: [
                'The requested URL does not exist on the server',
                'The request lacks valid authentication credentials for the target resource',
                'The server has suffered an internal unexpected exception',
                'The request method is not supported'
              ],
              correctOptionIndex: 1,
              explanation: 'HTTP 401 indicates that the client must authenticate themselves to obtain the requested response.'
            },
            {
              questionText: 'In EJS (Embedded JavaScript) templating, what is the difference between `<%= ... %>` and `<%- ... %>`?',
              options: [
                '<%= escapes HTML characters to prevent XSS, while <%- renders unescaped raw HTML',
                '<%- evaluates JavaScript loops, while <%= prints strings',
                'There is no difference between them',
                '<%= is used only for CSS comments'
              ],
              correctOptionIndex: 0,
              explanation: '<%= escapes unsafe HTML characters (preventing XSS), whereas <%- injects unescaped raw HTML output directly.'
            },
            {
              questionText: 'What does REST stand for in web API architecture?',
              options: [
                'Real-time Enterprise Server Transmission',
                'Representational State Transfer',
                'Remote Entity Synchronized Tracking',
                'Recursive Execution of System Threads'
              ],
              correctOptionIndex: 1,
              explanation: 'REST (Representational State Transfer) is an architectural style for networked hypermedia applications based on stateless client-server communication.'
            }
          ]
        }
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// Study Materials to Seed
// ---------------------------------------------------------------------------
const studyMaterialsData = [
  // AMCS
  { courseCode: 'AMCS', moduleNum: 1, title: 'Gradient Descent & Numerical Optimization Notes', type: 'PDF', url: '/materials/Gradient_Descent.docx.pdf', desc: 'Comprehensive guide to gradient descent formulation, cost functions, learning rates, and SGD.' },
  { courseCode: 'AMCS', moduleNum: 2, title: 'Linear Algebra Lecture Slides', type: 'PDF', url: '/materials/LinearAlgebra.pptx', desc: 'Matrix properties, eigenvalues, eigenvectors, determinants, and vector space transformations.' },
  { courseCode: 'AMCS', moduleNum: 3, title: 'Probability & Random Variables Guide', type: 'PDF', url: '/materials/Random_Variables.pptx.pdf', desc: 'Detailed notes on probability axioms, Bayes theorem, discrete/continuous distributions, and variance.' },
  { courseCode: 'AMCS', moduleNum: 1, title: 'Algorithms & Complexity Slides', type: 'PDF', url: '/materials/Algorithms.pptx', desc: 'Asymptotic notation, complexity classes, and computational analysis.' },

  // DS
  { courseCode: 'DS', moduleNum: 1, title: 'Data Structures Foundations Reference', type: 'PDF', url: '/materials/Data_Structure.pdf', desc: 'Introduction to data structures, memory layout, Big-O notation, and abstract data types.' },
  { courseCode: 'DS', moduleNum: 1, title: 'Types of Arrays Presentation', type: 'PDF', url: '/materials/Types_of_Arrays.pptx', desc: 'Static vs dynamic arrays, multi-dimensional matrices, and address calculation formulas.' },
  { courseCode: 'DS', moduleNum: 2, title: 'Stacks and Queues Complete Notes', type: 'PDF', url: '/materials/Stack_Queue.pdf', desc: 'LIFO & FIFO mechanisms, circular queues, deques, and expression evaluation algorithms.' },
  { courseCode: 'DS', moduleNum: 3, title: 'Linked List Theory & Implementations', type: 'PDF', url: '/materials/Linked_List.pdf', desc: 'Singly, doubly, and circular linked lists with pointer manipulation techniques.' },
  { courseCode: 'DS', moduleNum: 3, title: 'Linked List Variants & Applications', type: 'PDF', url: '/materials/Linked_List_Variants_Applications_Complete.pptx', desc: 'Polynomial arithmetic, sparse matrices, and advanced linked list applications.' },

  // SE
  { courseCode: 'SE', moduleNum: 1, title: 'Agile & Scrum Methodologies Reference', type: 'PDF', url: '/materials/Agile.pdf', desc: 'Agile principles, Scrum sprints, user stories, velocity tracking, and ceremonies.' },
  { courseCode: 'SE', moduleNum: 2, title: 'Software Engineering Architecture & Principles', type: 'PDF', url: '/materials/seap1.pdf', desc: 'SOLID principles, architectural patterns (MVC, layered, microservices), and testing strategies.' },

  // OS
  { courseCode: 'OS', moduleNum: 1, title: 'Process Management & Scheduling Handbook', type: 'PDF', url: '/materials/Process_Management.pdf', desc: 'Process lifecycles, PCB structures, context switches, and CPU scheduling algorithms.' },
  { courseCode: 'OS', moduleNum: 2, title: 'Paging & Memory Segmentation Guide', type: 'PDF', url: '/materials/Paging_and_Segmentation.pdf', desc: 'Virtual memory architecture, MMU address translation, page tables, TLBs, and segmentation.' },

  // DBMS
  { courseCode: 'DBMS', moduleNum: 1, title: 'ER Model & Conceptual Design Slides', type: 'PDF', url: '/materials/ER Model Conceptual Design.pptx', desc: 'Entity sets, relationships, cardinalities, weak entities, and relational mapping.' },
  { courseCode: 'DBMS', moduleNum: 2, title: 'Database Normalization Lecture Slides', type: 'PDF', url: '/materials/Database_Normalization.pptx', desc: 'Functional dependencies, 1NF, 2NF, 3NF, BCNF, and lossless join decomposition.' },
  { courseCode: 'DBMS', moduleNum: 3, title: 'Query Processing & Optimization Document', type: 'PDF', url: '/materials/Query Processing.pdf', desc: 'Relational algebra query trees, heuristic pushdown, join algorithms, and cost estimation.' },
  { courseCode: 'DBMS', moduleNum: 3, title: 'Advanced Query Processing Presentation', type: 'PDF', url: '/materials/NI_MCA_Query Processing.pptx', desc: 'Execution plans, B+ tree indexing strategies, and catalog statistical estimation.' },

  // WAD
  { courseCode: 'WAD', moduleNum: 1, title: 'JavaScript Fundamentals & ES6+ Reference', type: 'PDF', url: '/materials/JavaScript_Basics.pdf', desc: 'Execution contexts, closures, prototypes, event loops, promises, and modern ES6 syntax.' },
  { courseCode: 'WAD', moduleNum: 2, title: 'Web Development Lab Manual & Express Architecture', type: 'PDF', url: '/materials/WEB-DEVELOPMENT-LAB.pdf', desc: 'Node.js, Express middleware pipelines, EJS views, MongoDB Mongoose integration, and REST APIs.' }
];

// ---------------------------------------------------------------------------
// Seed Function
// ---------------------------------------------------------------------------
async function seedDatabase() {
  try {
    console.log('[Seed] Starting comprehensive FocusLearn database seed...');
    await connectDB();

    for (const cData of coursesData) {
      const course = await Course.findOneAndUpdate(
        { code: cData.code },
        {
          code: cData.code,
          title: cData.title,
          slug: cData.slug,
          durationHours: cData.durationHours,
          lessonCount: cData.modules ? cData.modules.length : cData.lessonCount,
          image: cData.image,
          description: cData.description,
          order: cData.order,
          category: cData.category || 'Master of Computer Applications'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[Seed] Course upserted: ${course.title} (${course.code})`);

      if (cData.modules && cData.modules.length) {
        // Clear old modules & quizzes for this course to ensure clean idempotency
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
            keyConcepts: mData.keyConcepts || [],
            topics: mData.topics || [
              {
                topicNumber: 1,
                title: mData.title,
                estimatedMinutes: mData.estimatedMinutes,
                pdfUrl: mData.pdfUrl
              }
            ],
            content: mData.content || mData.summary,
            order: mData.moduleNumber
          });
          console.log(`  [Seed] Module created: #${module.moduleNumber} "${module.title}" for ${course.code}`);

          if (mData.quiz) {
            const quiz = await Quiz.create({
              moduleId: module._id,
              courseId: course._id,
              title: mData.quiz.title,
              passingScore: 6,
              totalQuestions: mData.quiz.questions.length,
              questions: mData.quiz.questions
            });
            console.log(`    [Seed] Quiz created: "${quiz.title}" (${quiz.questions.length} Questions)`);
          }
        }

        // Keep course.lessonCount in exact sync
        course.lessonCount = cData.modules.length;
        await course.save();
      }
    }

    // Seed Study Materials
    console.log('[Seed] Populating Study Materials...');
    await StudyMaterial.deleteMany({});
    for (const m of studyMaterialsData) {
      const course = await Course.findOne({ code: m.courseCode });
      if (course) {
        let mod = null;
        if (m.moduleNum) {
          mod = await Module.findOne({ courseId: course._id, moduleNumber: m.moduleNum });
        }
        await StudyMaterial.create({
          title: m.title,
          description: m.desc,
          courseId: course._id,
          moduleId: mod ? mod._id : null,
          topicNumber: m.moduleNum || null,
          materialType: m.type,
          materialUrl: m.url,
          isPublished: true
        });
      }
    }
    console.log(`[Seed] Successfully seeded ${studyMaterialsData.length} Study Materials.`);

    // Verify user exists and ensure at least one sample study session exists
    const user = await User.findOne();
    if (user) {
      const dsCourse = await Course.findOne({ code: 'DS' });
      if (dsCourse) {
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
    }

    console.log('===========================================================');
    console.log('[Seed] ALL COURSES, MODULES, QUIZZES & MATERIALS SEEDED!');
    console.log('===========================================================');

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
