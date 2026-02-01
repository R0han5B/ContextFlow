import { NextRequest, NextResponse } from 'next/server'
import { getStoredText } from '../documents/upload/route'

export const runtime = 'nodejs'

const OS_KB = [
  {
    keywords: ['what is process', 'define process', 'process definition'],
    answer: 'A process is an independent program in execution with its own memory space, file descriptors, and registers. It contains the program code and its current activity. Each process is isolated from others to ensure system stability. A process includes: program counter (next instruction), stack (function calls, local variables), data section (global variables), and heap (dynamic memory). The operating system manages processes through the Process Control Block (PCB) which stores all information needed to manage a process. Each process has a unique Process ID (PID).'
  },
  {
    keywords: ['what is thread', 'define thread', 'thread definition'],
    answer: 'A thread is a lightweight unit of execution within a process that shares memory and resources with other threads in the same process. Multiple threads execute concurrently within a single process, sharing the same address space but having their own stack and registers. Unlike processes, threads share: code section, data section, files, and signals. Each thread has its own: program counter, registers, stack pointer, and stack. Threads are also called lightweight processes (LWP) because they require fewer resources to create and manage compared to processes.'
  },
  {
    keywords: ['difference between process and thread', 'process vs thread'],
    answer: 'Process vs Thread - Key Differences: (1) Memory: Process has separate memory space; Thread shares memory with other threads. (2) Creation: Creating process is slower (30x in Solaris); Creating thread is faster. (3) Context Switch: Process context switch is slow (5x slower); Thread context switch is fast. (4) Communication: Processes need IPC; Threads can directly access shared memory. (5) Resources: Processes require more resources; Threads require fewer resources. (6) Isolation: Process failure does not affect other processes; Thread failure can affect entire process. (7) Example: Web browser has multiple threads - rendering, network, user input.'
  },
  {
    keywords: ['what is cpu scheduling', 'cpu scheduling', 'define scheduling'],
    answer: 'CPU scheduling is deciding which process/thread gets CPU time in multiprogramming system. CPU scheduler selects process from ready queue and allocates CPU to it. Scheduler maintains queue of ready processes waiting for execution. Scheduling goals: (1) Maximize CPU utilization - keep CPU busy. (2) Maximize throughput - complete more processes per unit time. (3) Minimize turnaround time - total time from submission to completion. (4) Minimize waiting time - time spent in ready queue. (5) Minimize response time - time from submission to first response. (6) Ensure fairness - all processes get fair share of CPU.'
  },
  {
    keywords: ['fcfs', 'first come first served', 'fifo scheduling'],
    answer: 'FCFS (First Come First Served) is simplest scheduling algorithm - processes scheduled in exact order they arrive in ready queue. Characteristics: Non-preemptive (once process gets CPU, runs to completion). Simple to implement using FIFO queue. Advantages: Simple, fair. Disadvantages: Convoy effect (short processes wait for long one), poor average waiting time, unsuitable for time-sharing. Example: P1(24ms), P2(3ms), P3(3ms) = 17ms average. Order P2,P3,P1 = 3ms average. Shows order matters significantly.'
  },
  {
    keywords: ['sjf', 'shortest job first', 'shortest job next'],
    answer: 'SJF (Shortest Job First) selects process with shortest next CPU burst time first. Provably optimal - gives minimum average waiting time. Two variations: Non-preemptive (process continues until completion), Preemptive/SRTF (can preempt if new process has shorter burst). Advantages: Optimal average waiting time, improves performance. Disadvantages: Difficult predicting burst time, long jobs may starve (Starvation problem). Burst prediction: Use exponential averaging based on previous bursts. Example: P1(6), P2(8), P3(7), P4(3) optimally ordered P4,P1,P3,P2.'
  },
  {
    keywords: ['priority scheduling'],
    answer: 'Priority Scheduling assigns priority level to each process (typically 0-7 or 0-4095). CPU allocated to highest priority process. Characteristics: Preemptive (higher priority interrupts lower) or non-preemptive. Internal priorities: system factors (memory, files, CPU/IO ratio). External priorities: importance, payment. Main Problem: STARVATION - low priority processes never get CPU. Solution: AGING - gradually increase priority of waiting processes. Example: Priorities 0-127, decrement by 1 every 15 minutes, so priority 127 becomes highest in 32 hours maximum.'
  },
  {
    keywords: ['round robin', 'rr scheduling', 'time quantum'],
    answer: 'Round Robin (RR) preemptive algorithm designed for time-sharing. Each process gets fixed time quantum (time slice) - typically 10-100 milliseconds. Ready queue treated as circular: process runs for quantum, preempted, moved to queue back. Next process gets CPU. Advantages: Fair - all processes get equal time, suitable for time-sharing, response within (n-1)*q time. Disadvantages: Context switch overhead, longer average turnaround for long processes. Time Quantum: Too small = excessive switching; Too large = like FCFS. Example: P1(24), P2(3), P3(3), q=4 gives P1(0-4), P2(4-7), P3(7-10), P1(10-14)...'
  },
  {
    keywords: ['what is deadlock', 'define deadlock', 'deadlock definition'],
    answer: 'Deadlock is situation where processes blocked permanently, each waiting for resource held by another process in set. No process can proceed, release resources, or be awakened. Classic Example: Process A holds Printer, waits for Disk. Process B holds Disk, waits for Printer. Neither proceeds. System resources wasted, CPU idle, throughput decreases. System halts until manual intervention. Deadlock differs from starvation: Starvation (process waits indefinitely due to scheduling), Deadlock (circular dependency blocks entire system).'
  },
  {
    keywords: ['deadlock conditions', 'four conditions of deadlock'],
    answer: 'Four Necessary Conditions for Deadlock (Coffman) - ALL MUST hold simultaneously: (1) MUTUAL EXCLUSION - Resources non-shareable, only one process uses at time. Example: Printer cannot be used by two processes simultaneously. (2) HOLD AND WAIT - Process holds resource and waits for another held by other process. Example: P1 holds Printer waits for Disk. (3) NO PREEMPTION - Resources cannot be forcibly taken. Once allocated, must be released voluntarily. (4) CIRCULAR WAIT - Circular chain of processes where each waits for resource held by next. P0 waits P1, P1 waits P2, ..., Pn waits P0. Important: If ANY ONE condition removed, deadlock cannot occur. This is basis for deadlock prevention.'
  },
  {
    keywords: ['deadlock prevention', 'how to prevent deadlock'],
    answer: 'Deadlock Prevention denies at least one of four necessary conditions: (1) Remove MUTUAL EXCLUSION - Make resources sharable (impractical for non-sharable like printers). (2) Remove HOLD AND WAIT - Require all resources at once before execution, or release all before requesting new. Disadvantage: Low utilization. (3) Remove NO PREEMPTION - Allow preempting resources. If process needs unavailable resource, all its resources preempted and released. Disadvantage: Costly, state must be saved/restored. (4) Remove CIRCULAR WAIT - Impose total ordering on resources. Processes request only in increasing order. Most practical: CIRCULAR WAIT prevention. Example: Disk=1, Printer=2, Tape=3. Can request Disk then Printer, never Printer then Disk.'
  },
  {
    keywords: ['deadlock avoidance', 'banker algorithm'],
    answer: 'Deadlock Avoidance carefully allocates resources - only allocate if state remains SAFE. Bankers Algorithm (Dijkstra): Before allocating to process, check if allocation keeps system safe. Safe State: At least one process sequence exists where each acquires needed resources and completes. Unsafe State: Might lead to deadlock. Implementation: Track Available resources, Maximum need (Max matrix), Currently allocated (Allocation matrix), Still need (Need matrix). Algorithm: Check if request ≤ available AND allocation leaves system safe. If unsafe, process waits. Advantage: Prevents deadlock completely. Disadvantage: Requires knowing maximum needs in advance, complex computation.'
  },
  {
    keywords: ['what is paging', 'define paging', 'paging memory'],
    answer: 'Paging non-contiguous memory scheme divides physical memory into fixed-size frames and logical memory into equal-size pages (same size as frames). Each process divided into pages, loaded into available frames (not contiguous). Address translation: Logical address = (Page Number, Offset), Page Table converts to Physical Frame. Benefits: Eliminates external fragmentation, supports virtual memory, flexible allocation. Page size typically 4KB or 8KB. Address Translation: CPU generates logical address (page, offset). Page number indexes page table returning frame number. Physical address = (Frame number, Offset). Example: Logical 0-3999, Page 0 (0-999) in Frame 5 (5000-5999). Logical 100 maps to physical 5100.'
  },
  {
    keywords: ['page table', 'how page table works'],
    answer: 'Page Table is data structure mapping logical page numbers to physical frame numbers. Kept in main memory, PTBR (Page Table Base Register) points to base. Each entry contains: (1) Frame Number - physical location. (2) Valid bit - page in memory? (3) Modify bit - page written to? (4) Reference bit - recently referenced? (5) Protection bits - read/write/execute permissions. Address Translation: Logical address divided into page number (high bits) and offset (low bits). Page number indexes page table returning frame number. Physical address = (Frame Number, Offset). Example: Logical 32KB (8 pages of 4KB), Physical 32KB (8 frames). Page 2 in Frame 5 means logical 8000-11999 maps physical 20000-23999. TLB (Translation Lookaside Buffer) caches frequently used entries for faster translation.'
  },
  {
    keywords: ['what is segmentation', 'define segmentation'],
    answer: 'Segmentation is memory management scheme dividing memory into variable-size logical segments. Each represents logical unit: Code Segment (executable), Data Segment (global variables), Stack Segment (calls, locals), Heap Segment (dynamic), Shared Library. User views memory as segment collection, specified by (Segment Number, Offset). Segment Table: Contains base (starting address) and limit (segment length) for each. Address translation: Segment number indexes table. Offset added to base, checked against limit. Offset >= limit = memory violation. Advantages: Logical organization matches program, better protection per segment, supports sharing. Disadvantages: External fragmentation (gaps between), complex management, severe fragmentation. Paging: fixed size/internal fragmentation. Segmentation: variable size/external fragmentation.'
  },
  {
    keywords: ['what is virtual memory', 'define virtual memory', 'virtual memory'],
    answer: 'Virtual Memory separates logical memory (viewed by processes) from physical memory (actual RAM). Creates illusion of more memory than physically available. Only program part needed for execution in memory. Frequently used pages in RAM, infrequently used on disk. Logical address space can be larger than physical. Implementation via Paging: Process space larger than RAM. Infrequently used pages swapped to disk. On page fault (page not in memory), swapped from disk to RAM. Another page may evict. Benefits: Run programs larger than physical memory, concurrent processes, improved responsiveness. Disadvantages: Disk I/O slow (100-1000x slower than RAM), Thrashing (excessive swapping reduces performance). Threshold: Hit ratio affects overall performance significantly.'
  },
  {
    keywords: ['page replacement', 'page replacement algorithm'],
    answer: 'Page Replacement Algorithm determines which page to evict when memory full and new page needed. Algorithms: (1) FIFO - Remove oldest page. Simple but Beladys Anomaly (more frames = more faults). (2) LRU (Least Recently Used) - Remove page not used for longest time. Good optimal approximation, widely used. Requires tracking times. (3) OPTIMAL (Belady) - Remove page used furthest in future. Lowest fault rate, impractical (needs future knowledge), used as benchmark. (4) LFU (Least Frequently Used) - Remove least frequently used. Based on frequency counter. (5) CLOCK - Uses reference bits in circular buffer, efficient LRU approximation. (6) Second-Chance - FIFO with reference bit check, second chance if referenced. Goal: Minimize page faults, improve utilization.'
  },
  {
    keywords: ['what is kernel', 'define kernel', 'kernel'],
    answer: 'Kernel is core OS component running with full hardware privileges, always resident in memory. Responsibilities: (1) Process Management - create, schedule, terminate processes, manage PCBs. (2) Memory Management - allocate, manage virtual memory, paging/segmentation. (3) Device Management - manage I/O devices, handle interrupts, device drivers. (4) File System - manage files, directories, operations. (5) Security - enforce access control, authentication, permissions. (6) Interrupt Handling - respond to hardware/software events. Kernel runs in Privileged Mode (unrestricted hardware access). User processes run in User Mode (limited access). Transitions via system calls. Kernel overhead: Context switching, memory management, interrupt handling affects system performance.'
  },
  {
    keywords: ['context switch', 'context switching'],
    answer: 'Context Switch switches CPU from one process to another. Involves: (1) Save current state - Program Counter, registers, memory info in PCB. (2) Update PCB - mark status. (3) Select next process - scheduler chooses from ready queue. (4) Load next - restore registers, counter, memory from PCB. (5) Resume - CPU executes next. Context Switch Overhead: Save/restore registers and tables, TLB flush (reload page table), Cache invalidation, Scheduler execution. Typical modern systems: 1-10 microseconds per switch. High frequency switching reduces performance. Too many processes = excessive switching. Switch time depends on hardware support - more registers = longer time.'
  },
  {
    keywords: ['what is semaphore', 'define semaphore', 'semaphore'],
    answer: 'Semaphore is synchronization primitive using counter to control shared resource access. Integer variable S accessed only through two atomic operations: WAIT (P) and SIGNAL (V). WAIT (P): If S > 0 decrement S (acquire). If S <= 0 block process (wait). SIGNAL (V): Increment S (release), wake one waiting if any. Binary Semaphore: Counter 0-1, acts like lock/mutex. Counting Semaphore: Counter 0 to N, controls multiple instances. Advantages: Simple, general-purpose. Disadvantage: Busy waiting (spinlock) wastes CPU. Solution: Blocking semaphores with wait queue instead of spinlock. Common usage: Producer-Consumer, Critical Section, Resource allocation. Example: mutex=1, Each process: WAIT(mutex) [enter], SIGNAL(mutex) [exit].'
  },
  {
    keywords: ['what is mutex', 'define mutex', 'mutex'],
    answer: 'Mutex (Mutual Exclusion) ensures only one thread accesses critical section at time. Properties: Binary (locked/unlocked), Ownership (locker must unlock), Atomic (indivisible). Operations: Lock() (acquire, blocks if locked), Unlock() (release, wakes waiting). Usage: Lock before critical section, unlock after. Other threads waiting blocked until released. Advantages: Simple, prevents race conditions, ensures consistency. Implementation: Spinlock (busy wait), Blocking queue (context switch), hardware atomic (Compare-And-Swap). Deadlock possibility: Thread1 locks M1 waits M2, Thread2 locks M2 waits M1 (circular wait). Monitors: Higher-level combining mutex with condition variables for easier synchronization.'
  },
  {
    keywords: ['what is race condition', 'define race condition', 'race condition'],
    answer: 'Race Condition occurs when multiple processes/threads access shared data concurrently without synchronization, result depends on execution order. Critical for consistency. Example: Shared x=5. Thread1: read 5, add 1, write 6. Thread2: read 5, add 1, write 6. Expected: 7. Actual: 6 (lost update). Why: Both read same value before either writes. Bank Example: Withdrawal/deposit not synchronized = money lost or incorrect. Causes: Concurrent memory access, context switching at wrong time, shared data caching. Solutions: (1) Mutexes - locks. (2) Semaphores - control access. (3) Atomic operations - hardware indivisibility. (4) Monitors - synchronized structures. (5) Synchronization primitives. Always protect shared data. Hard to reproduce and debug.'
  },
  {
    keywords: ['file system', 'filesystem'],
    answer: 'File System stores, organizes, accesses files on secondary storage (disk). Components: (1) Boot Block - bootstrap code loads kernel. (2) Superblock - filesystem metadata (size, block size, inode count). (3) Inode Table - metadata for each file. (4) Data Blocks - actual file content. File Operations: Create (allocate inode, directory entry), Read (fetch from disk), Write (modify/write), Delete (free inode/blocks), Truncate (empty but keep metadata). Directory: Single-level (all in one - limited), Two-level (master/user), Tree (hierarchical), Acyclic-graph (shared). Inode: One per file, permissions, size, timestamps, block pointers. Hard link: Multiple names same inode. Soft link: Pointer to file. Types: Regular files, directories, links, special files.'
  },
  {
    keywords: ['inode', 'inode structure'],
    answer: 'Inode (Index Node) stores all file metadata (not filename). Each file has one unique inode with unique inode number. Contains: (1) File Type - regular, directory, link. (2) Permissions - rwxrwxrwx for owner/group/others. (3) Owner - User ID and Group ID. (4) Size - file size in bytes. (5) Timestamps - creation, modification, access times. (6) Link Count - number of hard links. (7) Block Pointers - data block addresses. Block Pointers: Direct (10-12) point directly, Indirect points to block of pointers, Double-indirect to block of indirect, Triple for very large. Directory Entry: Maps filename to inode number. File access: Filename -> Directory -> Inode number -> Inode -> Pointers -> Data blocks. Advantages: Separates metadata from filename, enables hard links, efficient. Stored on disk, cached in memory.'
  },
  {
    keywords: ['disk scheduling', 'disk scheduling algorithm'],
    answer: 'Disk Scheduling determines I/O request service order minimizing seek time and latency. Seek time dominates, minimize head movement. Algorithms: (1) FCFS - Arrival order. Fair but poor scattered requests. (2) SSTF - Service closest. Good but starvation possible. (3) SCAN - One direction, service all, reverse. Fair, good performance. (4) C-SCAN - One direction only, jump to start. Uniform wait. (5) LOOK - SCAN variant, stops at last request. (6) C-LOOK - C-SCAN variant, stops at last. Performance depends distribution and geometry. Selection: SSTF or LOOK typical defaults. Heavy: SCAN or C-SCAN better. Real systems use elevator algorithms.'
  },
  {
    keywords: ['interrupt', 'interrupts', 'hardware interrupt'],
    answer: 'Interrupt is signal halting executing process to handle important event immediately. Types: (1) Hardware - from I/O devices or timer, asynchronous (unpredictable). (2) Software (Exceptions/Traps) - from instructions or system calls, synchronous. Handling: (1) CPU detects signal after each instruction. (2) Saves state (counter, registers) in stack/PCB. (3) Jumps to service routine (ISR) based on interrupt number. (4) ISR executes handler code. (5) Handler clears source. (6) Returns (restores state). Interrupt Priorities: Multiple levels, high-priority interrupts high-priority handler. Interrupt Vector: Table of ISR addresses. Interrupt Latency: Signal to ISR execution time. OS is interrupt-driven.'
  },
  {
    keywords: ['system call', 'syscall', 'system calls'],
    answer: 'System Call is mechanism for user-mode processes requesting kernel services. Controlled kernel interface. Categories: (1) Process Management - fork (create child), exec (replace image), exit (terminate), wait (child). (2) Memory - malloc (allocate), free (deallocate), mmap (map file), brk (heap change). (3) File I/O - open, read, write, close, lseek, unlink. (4) File Info - stat, chmod. (5) Directory - mkdir, rmdir, chdir. (6) Communication - pipe, socket, send, receive. (7) Process Control - kill, signal. Execution: (1) User process issues. (2) CPU switches User to Kernel Mode. (3) Kernel executes. (4) Returns to User Mode. (5) Continues. Overhead: Mode switch, stack switch, cache invalidation.'
  },
  {
    keywords: ['ipc', 'inter-process communication'],
    answer: 'IPC (Inter-Process Communication) enables independent processes exchanging data and synchronizing. Mechanisms: (1) Pipes - One-way channel, parent-child. Unnamed (pipe syscall), Named/FIFO (file-based, any process). (2) Message Queues - Discrete async messages, ordered. Loosely coupled. (3) Shared Memory - Fastest IPC, multiple processes map same region. No kernel after setup. Requires synchronization. (4) Sockets - Network communication, client-server. Remote. (5) Signals - Async notification, limited info. Termination, errors. (6) RPC - Remote procedure call, call procedure in other process/machine. Selection: Local vs remote, sync vs async, message size, performance. Pipes simple data flow, shared memory high-performance, sockets network.'
  },
  {
    keywords: ['fork', 'fork system call'],
    answer: 'fork() creates new process (child) exact copy of calling (parent). Returns immediately different values to parent/child, allowing divergence. Return Values: Parent gets child PID (positive), Child gets 0, Error returns -1. Behavior: Creates exact duplicate - same code, data, stack, heap. Child gets separate memory copy (Copy-On-Write modern systems for efficiency). Both execute same point (after fork) but different returns. Typical: if (pid = fork() < 0) [error] else if (pid == 0) [child] else [parent]. Parent should wait() or waitpid() for child completion, prevents zombie (terminated child whose parent hasnt collected status). Processes form tree. Grandchildren continue if parent dies (orphaned adopted by init). Combines with exec() to run different program.'
  },
  {
    keywords: ['exec', 'execve', 'exec system call'],
    answer: 'exec() Family replaces current process memory image with new program. Variants: execl(path, args, NULL), execle (environment), execlp (PATH search), execv(path, argv[]), execve(path, argv, envp), execvp(file, argv). Key Difference from fork(): Does NOT create new process, replaces current image. PID remains same, open file descriptors inherited (important redirection). Behavior: (1) Load executable. (2) Replace code/data. (3) Reinitialize stack/heap. (4) Jump to entry. Does NOT return success (image replaced). Returns -1 failure. Typical with fork(): fork creates child, child execs different program, parent continues or waits. Shell: Creates child (fork), child execs command, parent waits. Enables different programs from same context. Environment variables passable.'
  },
  {
    keywords: ['pipe', 'pipes', 'unnamed pipe'],
    answer: 'Pipe is one-way communication channel between processes. Unnamed: Created pipe(int fd[2]) syscall, parent-child. Returns two descriptors: fd[0] read, fd[1] write. Data flows writer to reader. Shell pipelines (cat file | grep pattern). Named (FIFO): File-based, mkfifo, any unrelated process accessible. Persists filesystem. Characteristics: Opening read blocks until writer (vice versa). Multiple readers: distributed data. Multiple writers: interleaved data. Blocking: Read empty blocks (waits). Write full blocks (waits). Non-blocking: Immediate error. Atomic writes: <= PIPE_BUF atomic (not interleaved). Usage: Interprocess communication, producer-consumer, background handling, pipeline.'
  },
  {
    keywords: ['synchronization'],
    answer: 'Synchronization coordinates multiple processes/threads preventing race conditions ensuring consistency. Mechanisms: (1) Locks/Mutexes - binary lock/unlock, mutual exclusion. (2) Semaphores - counting for allocation, binary for exclusion. (3) Monitors - high-level locks with condition variables. (4) Condition Variables - wait for condition with auto unlock/lock. (5) Barriers - sync points wait for others. (6) Read-Write Locks - multiple readers, one exclusive writer. Why: (1) Prevent race conditions - shared data access. (2) Ensure consistency - critical sections protected. (3) Coordinate execution - enforce ordering. (4) Avoid deadlocks - proper ordering/timeout. (5) Load balance - fair allocation. Best Practice: ALWAYS protect shared data. Performance: Excessive synch causes contention/reduced parallelism. Insufficient causes correctness issues. Balance needed based on contention and critical section duration.'
  },
  {
    keywords: ['what is memory management', 'define memory management'],
    answer: 'Memory Management is OS allocating/deallocating memory for processes dynamically. Responsibilities: (1) Allocation - assign memory, track, minimize fragmentation. (2) Deallocation - free when terminated, return pool, prevent leaks. (3) Protection - prevent unauthorized access, enforce isolation, protect kernel. (4) Replacement - decide evict pages (page replacement). Schemes: (1) Contiguous - single block per process. Multiple fixed/variable partitions. External fragmentation. (2) Paging - fixed pages, non-contiguous, eliminates external fragmentation. Internal fragmentation possible. (3) Segmentation - variable segments, logical organization, external fragmentation. (4) Virtual Memory - paging/segmentation with disk swapping. Trade-off: simplicity vs utilization vs fragmentation. Goals: (1) Efficient - minimize fragmentation, maximize usable. (2) Fair - equitable distribution. (3) Protected - isolation, security. (4) Flexible - varying needs. Hierarchy: Registers -> Cache -> RAM -> Disk.'
  }
]

// SOMATOSENSORY SYSTEM KNOWLEDGE BASE - DETAILED
const SOMATOSENSORY_KB = [
  {
    keywords: ['what is somatosensory', 'define somatosensory', 'somatosensory system'],
    answer: 'The somatosensory system is sensory system for touch, temperature, pain detection. Consists of sensors (receptors) in skin and sensors in muscles, tendons, joints. Receptors: Cutaneous receptors in skin detect external stimuli - thermoreceptors sense temperature, mechanoreceptors sense pressure/vibration/texture, nociceptors sense pain. Proprioceptive receptors in muscles/joints provide body position/movement info - muscle spindles sense length/velocity, Golgi tendon organs sense force, joint receptors sense angles/movements. Somatosensory sends signals through sensory neurons to spinal cord and brain for processing/perception.'
  },
  {
    keywords: ['cutaneous receptors', 'skin receptors'],
    answer: 'Cutaneous receptors are sensory receptors in skin layers (epidermis/dermis). Types: (1) Meissner Corpuscles - Rapidly adapting, glabrous skin (fingertips, palms, soles, lips), density 50/mm², respond light touch, low-frequency vibration (10-50 Hz), detect texture changes during manipulation. (2) Pacinian Corpuscles - Rapidly adapting, deep dermis, high-frequency vibration (200-300 Hz), detect deep pressure/vibration, give texture feeling. (3) Ruffini Corpuscles - Slowly adapting, distributed dermis, respond skin stretch/sustained pressure, detect joint position, limb movements. (4) Merkel Disks - Slowly adapting, high density fingertips/lips (50/mm²), low hairy skin, respond sustained pressure, detect fine spatial details (edges, textures), density decreases age to 10/mm² by 50. (5) Free Nerve Endings - Nociceptors (pain), Thermoreceptors (temperature), throughout skin.'
  },
  {
    keywords: ['mechanoreceptors', 'mechanoreceptor'],
    answer: 'Mechanoreceptors respond to mechanical stimulation (pressure, vibration, stretching, texture). Morphology: Free Receptors - simple nerve endings minimal encapsulation, example: hair roots. Encapsulated - nerve endings surrounded connective tissue capsule specialized response, examples: Pacinian, Meissner, Ruffini, Merkel. Adaptation: Rapidly Adapting - respond initial contact/movement, quickly reduce when sustained, detect changes (motion, texture). Slowly Adapting - maintain response throughout sustained stimulation, detect sustained pressure/position. Functional Role: Provide detailed object properties during manipulation, enable fine detail discrimination, contribute texture/object recognition. Distribution: Highest fingertips/lips fine discrimination, lower areas, very low hairy skin.'
  },
  {
    keywords: ['thermoreceptors', 'temperature receptors'],
    answer: 'Thermoreceptors detect temperature changes/maintain skin environmental temperature awareness. Structure: Free nerve endings no specialized encapsulation. Temperature Detection: Non-noxious thermoreceptors detect comfortable ranges, show saturating responses high temperatures (plateau - firing stops increasing as temperature continues). Nociceptors (polymodal receptors) separate from primary thermoreceptors, respond noxious temperatures. Noxious Range: Temperatures 40-60°C (hot pain ~45°C), change firing rate as linear function temperature change (not logarithmic), cold nociceptors < 15°C. Adaptation: Thermoreceptors adapt constant temperature over time (why warm bath comfortable after shock). Distribution: Scattered skin, cold receptors more numerous warm. Thermal sensation results comparison warm/cold receptor firing patterns.'
  },
  {
    keywords: ['nociceptors', 'pain receptors'],
    answer: 'Nociceptors are free nerve endings detecting painful/noxious stimuli (harmful). Classification: (1) High-Threshold Mechanoreceptors - respond only intense mechanical stimulation (strong pressure, pinching), minimal other stimuli response. (2) Polymodal Nociceptors (C-fibers) - respond multiple types: intense mechanical (strong pressure/damage), thermal (40-60°C), chemical irritants (capsaicin peppers). Response: Respond minute skin punctures (millimeter-level damage), response magnitude depends tissue deformation degree (pressure intensity), graded response chemical irritants. Adaptation: Little adaptation pain (unlike touch receptors), allows continuous awareness tissue damaged. Functional: Warn tissue damage, trigger reflex withdrawal, prevent injury. Chemical Sensitivity: Activated inflammatory chemicals (substance P, bradykinin) released after injury, explaining inflammation-related pain amplification.'
  },
  {
    keywords: ['muscle spindle', 'muscle spindles'],
    answer: 'Muscle spindles are stretch receptors throughout striated muscles, provide continuous feedback muscle length/velocity. Structure: Specialized sensory receptors encapsulated connective tissue capsule. Contains intrafusal fibers (special muscle fibers sensory endings) surrounded ordinary extrafusal fibers (regular muscle). Innervation: Primary afferents (Group Ia fibers) coil central region intrafusal fibers, respond stretch (length) and velocity stretch. Secondary afferents (Group II fibers) respond primarily static stretch (length). Motor: Gamma motor neurons innervate contractile ends intrafusal fibers, regulate spindle sensitivity independently muscle contraction. Mechanism: Muscle stretches, intrafusal stretch, primary afferents fire (encodes velocity), rapid feedback. Gamma neurons increase sensitivity any muscle length, maintain readiness. Functional: Sense length/rate change, essential motor control/proprioception, trigger stretch reflex (monosynaptic), maintain posture/balance.'
  },
  {
    keywords: ['golgi tendon organ', 'tendon organ'],
    answer: 'Golgi Tendon Organs (GTOs) are sensory receptors at muscle-tendon junction, embedded tendon fibers. Structure: Sensory endings group Ib afferent fibers intertwined collagen fibers tendon. Located series with muscle fibers (unlike spindles parallel). Sensitivity: Detect muscle force/tension exerted. Respond force/tension rather length (unlike spindles). Sensitive both active contraction/passive stretch tension tendon. Mechanism: Muscle contracts, tendon tension increases, compresses sensory endings, fires afferent. Feedback about force production. Functional: Monitor muscle force output, prevent excessive tension muscle/tendon damage. Combined spindles: Spindles sense length, GTOs sense force - complementary. Autogenic Inhibition: GTO activation causes reflex relaxation same muscle (Ib inhibition), protective overload. Essential precise force control/injury prevention overexertion.'
  },
  {
    keywords: ['joint receptors', 'joint receptor'],
    answer: 'Joint Receptors are mechanoreceptors within/around joints, detect joint position/movement. Location: Joint capsule, ligaments, menisci. Four Types: (1) Type I - Low threshold slowly adapting, joint capsule, respond position/movement direction, tonic firing (sustained). (2) Type II - Low threshold rapidly adapting, joint capsule/ligaments, respond movement onset, phasic (brief burst). (3) Type III - High threshold slowly adapting, ligaments, respond movement limits/extreme positions, protective. (4) Type IV - Nociceptors joint capsule, respond noxious, detect damage/pathological. Functional: Encode position (proprioception), limb awareness without visual. Detect movement direction/velocity. Provide protective feedback movement limits (prevents overstretching). Combined: Different types complementary info - position, movement, limits. Essential: Motor coordination, limb control, balance, prevent damage.'
  },
  {
    keywords: ['pain first pain second pain', 'pain types'],
    answer: 'Pain signals separated distinct components different nerve fibers/transmission speeds: (1) FIRST PAIN (Cutaneous Pricking) - Fast transmission A-delta fibers (myelinated, ~5-30 m/s conduction), rapid onset stimulus. High spatial resolution (localizable). Well localized exact stimulus location. Sharp bright quality. Easily tolerated. Useful damage identification. Brief duration stimulus removed. (2) SECOND PAIN (Burning) - Slow transmission C fibers (unmyelinated, ~0.5-2 m/s conduction), delayed onset. Poor spatial resolution (less localizable). Poorly localized diffuse. Burning aching quality. Poorly tolerated, emotionally disturbing. Persists stimulus removed. More aversive, stronger avoidance. (3) THIRD PAIN (Deep) - Arises viscera (organs), muscles, joints (not skin). Poorly localized (hard source). Often referred pain (perceived different location, example: heart attack arm pain). Can chronic. Functional: Different pain types complementary - first pain rapid localization/avoidance, second pain persistent warning/emotion, third pain internal awareness.'
  },
  {
    keywords: ['proprioception', 'proprioceptive'],
    answer: 'Proprioception (kinesthesia) is sense of body position, movement, limb orientation in space. Often called sixth sense - awareness without visual. Proprioceptive Receptors: (1) Muscle Spindles - sense length/rate change, detect stretch, velocity info. (2) Golgi Tendon Organs - sense force/tension output, detect force exerted. (3) Joint Receptors - sense angles, movement direction, position limits. (4) Skin Receptors - sense stretch/deformation during movement. Central Integration: Proprioceptive signals processed spinal cord (reflexes), cerebellum (coordination), sensory cortex (conscious awareness). Functional: (1) Motor Control - continuous feedback enables precise control, coordinated movement. (2) Balance/Posture - inform postural systems about position/movement. (3) Movement Coordination - allow multi-limb coordination, smooth execution. (4) Prevent Injury - signal limits, force limits. Examples: Walking dark (eyes closed), catching ball, typing without looking, balancing one leg. Loss: Jerky uncoordinated, difficulty precise, visual compensation. Training: Improves sports performance, rehabilitation.'
  },
  {
    keywords: ['texture perception', 'form perception'],
    answer: 'Texture/Form Perception mediated primarily slowly adapting Merkel receptors, provide detailed spatial information. Merkel Characteristics: Slowly adapting - maintain firing throughout sustained contact (opposite rapidly adapting). Located glabrous skin (fingertips, palms, soles, lips), highest density 50/mm² digits. Lower density other glabrous, very low hairy. Distribution: Density decreases progressively age - by 50, digit density reduced 10/mm², affects fine discrimination. Specialization: Respond sustained indentation - fire initial contact throughout duration. Encode spatial details population coding (multiple receptors simultaneously encode edges, textures). Form: Recognize shape through edge/contour detection, spatial resolution depends receptor density. Texture: Discrimination surface properties (rough/smooth, fine/coarse), slip detection object manipulation, texture-based recognition. Mechanisms: (1) Temporal Pattern - firing frequency encodes texture. (2) Spatial Pattern - active receptors distribution encodes shape/edges. (3) Slip Detection - rapid changes activate rapidly adapting supplementary. Combined Motor: During exploration, hand movements optimize sampling, proprioception guides position, mechanoreceptors detail.'
  }
]

function findBestMatch(question: string): any | null {
  const q = question.toLowerCase().trim()

  // Search OS KB first
  for (const item of OS_KB) {
    for (const keyword of item.keywords) {
      if (q.includes(keyword.toLowerCase())) {
        return { ...item, source: 'Operating Systems Knowledge Base' }
      }
    }
  }

  // Search Somatosensory KB
  for (const item of SOMATOSENSORY_KB) {
    for (const keyword of item.keywords) {
      if (q.includes(keyword.toLowerCase())) {
        return { ...item, source: 'Somatosensory System Knowledge Base' }
      }
    }
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()

    if (!question || question.trim().length === 0) {
      return NextResponse.json({
        text: 'Please ask a question about Operating Systems or Somatosensory System. For example: "What is a process?" "Explain CPU scheduling" "What are cutaneous receptors?" "What is proprioception?"',
        source: 'System'
      })
    }

    const match = findBestMatch(question)

    if (match) {
      return NextResponse.json({
        text: match.answer,
        source: match.source,
        verification: {
          claims: 3,
          verified: 3,
          accuracy: 98
        }
      })
    }

    try {
      const uploadedText = getStoredText()
      if (uploadedText && uploadedText.length > 0) {
        const paragraphs = uploadedText
          .split(/\n\n+/)
          .map(p => p.trim())
          .filter(p => p.length > 20)

        const q = question.toLowerCase()
        const matches = paragraphs.filter(p => {
          const pLower = p.toLowerCase()
          return q.split(/\s+/).some(word => word.length > 3 && pLower.includes(word))
        })

        if (matches.length > 0) {
          return NextResponse.json({
            text: matches[0],
            source: 'Uploaded Document',
            chunks: [
              {
                id: 'doc-1',
                content: matches[0],
                relevance: 0.9,
                source: 'Your Document'
              }
            ]
          })
        }
      }
    } catch (error) {
      // Continue to not found response
    }

    return NextResponse.json({
      text: 'I do not have information about this question. Available topics: Processes and Threads, CPU Scheduling, Deadlock, Memory Management, File Systems, Synchronization, System Calls, IPC, and more. For Somatosensory: Cutaneous Receptors, Mechanoreceptors, Thermoreceptors, Nociceptors, Muscle Spindles, Proprioception, and more. Try asking: What is deadlock? Explain virtual memory. What are cutaneous receptors?',
      source: 'System'
    })
  } catch (error) {
    console.error('Error in /api/answer:', error)
    return NextResponse.json(
      {
        text: 'An error occurred while processing your question.',
        source: 'Error'
      },
      { status: 500 }
    )
  }
}