# ⬡ Smart Parking System

> A DSA Hackathon Project — Full-stack implementation of a smart parking management system demonstrating 6 core Data Structures & Algorithms, built originally in **Java** and ported to a live **React** frontend.

---

## 📌 Table of Contents

- [Project Overview](#project-overview)
- [Live Demo](#live-demo)
- [DSA Concepts Used](#dsa-concepts-used)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How Each DSA Works in This Project](#how-each-dsa-works-in-this-project)
- [Vehicle Number Format](#vehicle-number-format)
- [Algorithm Complexity Summary](#algorithm-complexity-summary)
- [Tech Stack](#tech-stack)
- [Team](#team)

---

## Project Overview

The **Smart Parking System** simulates a real-world parking lot management system. It handles vehicle entry and exit, optimal slot assignment, waiting lists, undo operations, vehicle search, and sorted display — all powered by carefully chosen Data Structures for maximum efficiency.

The project has two implementations:
- **`/Original_Java/Main.java`** — The original console-based Java implementation (submitted as DSA logic proof)
- **`/src/SmartParkingSystem.jsx`** — A fully functional React frontend with the same DSA logic rewritten in JavaScript

---

## Live Demo

- **Live Website:** [Open Smart Parking System](https://id-preview--61fb5c86-adb8-4979-b4c0-147d674eb6c0.lovable.app/)
- 
- **UI Walkthrough Video:** [Watch UI Demo](https://drive.google.com/file/d/1D5pdhaueai2HByMON5tfxmqbNtAa2f0v/view?usp=drive_link)

- **Video Link:** [Watch Project Demo](https://drive.google.com/file/d/15H53i1Ivrg60YZ9CJHNgLN1hggIKgSAU/view?usp=drivesdk)

- **PPT:** [View Project Presentation](https://docs.google.com/presentation/d/1uZ6JhnlenV98laIjlREvM57sgYoOJiAz/edit?pli=1&slide=id.p2#slide=id.p2)

---

## DSA Concepts Used

| # | Data Structure | Where Used | Time Complexity |
|---|---------------|------------|-----------------|
| 1 | **Min-Heap** (Priority Queue) | Optimal slot assignment | O(log n) insert/delete |
| 2 | **HashMap** | Vehicle lookup by plate number | O(1) average |
| 3 | **Stack** | Undo last parking action (LIFO) | O(1) push/pop |
| 4 | **Queue** (LinkedList) | Waiting list when parking is full (FIFO) | O(1) enqueue/dequeue |
| 5 | **Binary Search** | Search vehicle in sorted log | O(log n) |
| 6 | **Merge Sort** | Sort vehicles by entry time | O(n log n) |

---

## Features

- **Park a Vehicle** — Assigns the nearest available slot using Min-Heap
- **Remove a Vehicle** — Frees the slot and auto-parks the next waiting vehicle
- **Undo Last Action** — Reverses the most recent parking using a Stack
- **Waiting Queue** — Automatically manages overflow when all 10 slots are full
- **Search Vehicle** — Binary search on a sorted log for O(log n) lookup
- **Sorted View** — All parked vehicles sorted by entry time using Merge Sort
- **Live Duration Timer** — Shows how long each vehicle has been parked
- **Activity Log** — Real-time log of every action with color-coded status
- **Input Validation** — Enforces Indian vehicle number format (e.g. `MH12AB1234`)

---

## Project Structure

```
smart-parking-system/
│
├── Original_Java/
│   └── Main.java                  # Original Java DSA implementation
│
├── public/
│   └── index.html
│
├── src/
│   ├── SmartParkingSystem.jsx     # React frontend with JS DSA logic
│   └── App.js                     # Entry point — imports SmartParkingSystem
│
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or above)
- npm (comes with Node.js)

### Installation & Running

```bash
# 1. Clone the repository
git clone https://github.com/your-username/smart-parking-system.git

# 2. Navigate into the project
cd smart-parking-system

# 3. Install dependencies
npm install

# 4. Start the development server
npm start
```

The app will open at `http://localhost:3000`

### Running the Original Java Version

```bash
# Navigate to the Java source
cd Original_Java

# Compile
javac Main.java

# Run
java smartParkingSystem.Main
```

---

## How Each DSA Works in This Project

### DSA 1 — Min-Heap (Priority Queue)

**Problem:** When a vehicle arrives, which slot should it be assigned?

**Solution:** All available slot indices are stored in a Min-Heap. When a vehicle parks, we `poll()` (pop the minimum) to get the **lowest-numbered available slot** — the nearest slot to the entrance. When a vehicle leaves, its slot index is pushed back into the heap.

```
Available slots in heap: [0, 2, 5, 7]
Vehicle arrives → poll() → assigned Slot 1 (index 0)
Heap becomes: [2, 5, 7]
```

**Why not a simple array scan?**
- Array scan: O(n) every time
- Min-Heap: O(log n) — significantly faster for large parking lots

---

### DSA 2 — HashMap

**Problem:** How do we quickly check if a vehicle is already parked or find which slot it's in?

**Solution:** A HashMap stores `vehicleNumber → ParkingRecord`. Every park/remove/search operation does an O(1) key lookup instead of scanning all slots.

```
vehicleMap = {
  "MH12AB1234" → { slotIndex: 3, entryTime: 1720000000000 },
  "KA05CD5678" → { slotIndex: 7, entryTime: 1720000050000 }
}
```

---

### DSA 3 — Stack (Undo)

**Problem:** How do we support undoing the last parking action?

**Solution:** Every time a vehicle is parked, its `ParkingRecord` is pushed onto a Stack. The Undo operation pops the top record and reverses the parking — exactly like Ctrl+Z in a text editor.

```
Stack (top → bottom):
[ MH12AB1234 → Slot 1 ]   ← most recent, popped on undo
[ KA05CD5678 → Slot 4 ]
```

---

### DSA 4 — Queue (Waiting List)

**Problem:** What happens when all 10 slots are full and a new vehicle arrives?

**Solution:** The vehicle is added to a FIFO Queue (LinkedList). When any slot is freed (vehicle removed), the system automatically dequeues the first waiting vehicle and parks it in the freed slot.

```
Waiting Queue: [ DL01EF9999, MH04GH1111, TN09IJ2222 ]
Slot freed → DL01EF9999 dequeued and auto-parked
Queue becomes: [ MH04GH1111, TN09IJ2222 ]
```

---

### DSA 5 — Binary Search

**Problem:** How do we efficiently search for a vehicle among all vehicles that ever parked?

**Solution:** A separate sorted ArrayList of vehicle numbers is maintained (insertion is done via binary-search-based insert to keep it sorted at all times). When searching, Binary Search runs in O(log n) instead of O(n) linear scan.

```
Sorted Log: [ "DL01AB1234", "KA05CD5678", "MH12AB1234" ]
Search "MH12AB1234":
  mid = "KA05CD5678" → too small → search right half
  mid = "MH12AB1234" → FOUND ✓
```

---

### DSA 6 — Merge Sort

**Problem:** How do we display all parked vehicles in order of who arrived first?

**Solution:** The list of `ParkingRecord` objects is sorted by `entryTime` using Merge Sort — a stable, O(n log n) divide-and-conquer algorithm. This guarantees correct ordering even for large numbers of vehicles.

```
Records:  [KA (10:05), MH (09:45), DL (10:02)]
After Merge Sort: [MH (09:45), DL (10:02), KA (10:05)]
```

**Why Merge Sort over Bubble/Selection Sort?**
- Bubble Sort: O(n²) — too slow for real-time sorting
- Merge Sort: O(n log n) — consistent performance, stable sort

---

## Vehicle Number Format

The system validates Indian vehicle registration numbers in the format:

```
MH 12 AB 1234
│  │  │  └─── 4-digit unique number
│  │  └────── 2-letter series code
│  └───────── 2-digit district code
└──────────── 2-letter state code
```

**Valid examples:** `MH12AB1234`, `KA05CD5678`, `DL01EF9999`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend UI | React 18 |
| Styling | Inline CSS with CSS-in-JS variables |
| DSA Logic | Java 17 |
| State Management | React `useState` |
| Build Tool | Create React App |

---

## Algorithm Complexity Summary

| Operation | DSA Used | Time Complexity | Space Complexity |
|-----------|----------|-----------------|------------------|
| Park vehicle | Min-Heap + HashMap + Stack | O(log n) | O(n) |
| Remove vehicle | HashMap + Min-Heap | O(log n) | O(1) |
| Search vehicle | Binary Search | O(log n) | O(1) |
| Undo last park | Stack | O(1) | O(1) |
| Add to waiting list | Queue | O(1) | O(1) |
| Sort by entry time | Merge Sort | O(n log n) | O(n) |
| Check duplicate | HashMap | O(1) | O(1) |

---

## Team
Team Name: AlgoArchitect
Team Participants: 
Aakanksha Kulkarni
Rajasee Thakur
Ekta Kundnani
Shravani Raut


---


