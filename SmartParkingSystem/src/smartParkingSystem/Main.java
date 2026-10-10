//============================================================
// SMART PARKING SYSTEM — DSA Hackathon Project
// DSA Concepts Used:
// 1. Min-Heap (PriorityQueue) — optimal slot assignment O(log n)
// 2. HashMap — O(1) vehicle lookup
// 3. Stack — undo last parking action
// 4. LinkedList (Queue) — waiting list when parking is full
// 5. Binary Search — search vehicle in sorted log
// 6. Merge Sort — sort vehicles by entry time
// ============================================================

package smartParkingSystem;
import java.util.*;

// CLASS: ParkingRecord
// Stores one vehicle's parking information
// Used in sorting (Merge Sort by entry time)
class ParkingRecord {

	String vehicleNumber; // vehicle plate number
	int slotIndex; // which slot (0-based internally)
	long entryTime; // System.currentTimeMillis() at entry

	// Constructor
	public ParkingRecord(String vehicleNumber, int slotIndex, long entryTime) {
		this.vehicleNumber = vehicleNumber;
		this.slotIndex = slotIndex;
		this.entryTime = entryTime;
	}

	@Override
	public String toString() {
		return vehicleNumber + " → Slot " + (slotIndex + 1)
				+ " (Entered: " + new java.util.Date(entryTime) + ")";
	}
}

// CLASS: ParkingSystem
// Core system — all DSA logic lives here

class ParkingSystem {
	
	// DATA STRUCTURES

	static int totalSlots = 10;

	// Array — direct slot storage, O(1) access by index
	static String[] parkingSlots = new String[totalSlots];

	// DSA 1: MIN-HEAP (PriorityQueue)
	// Stores available slot indices, smallest slot index at top
	// Benefit: Always gives the NEAREST/lowest available slot in O(log n)
	// Without this: we'd scan entire array O(n) every time
	static PriorityQueue<Integer> availableSlots = new PriorityQueue<>();

	// DSA 2: HASHMAP
	// Maps vehicleNumber → ParkingRecord for O(1) lookup
	// Without this: we'd search entire array O(n) to find a vehicle
	static HashMap<String, ParkingRecord> vehicleMap = new HashMap<>();

	// DSA 3: STACK
	// Stores last parked vehicle for UNDO feature
	// LIFO: Last parked = first to undo (like Ctrl+Z)
	static Stack<ParkingRecord> undoStack = new Stack<>();

	// DSA 4: QUEUE (LinkedList)
	// Waiting list when all slots are full
	// FIFO: First vehicle to wait = first to get a slot
	static Queue<String> waitingQueue = new LinkedList<>();

	// DSA 5 & 6: Sorted log for Binary Search
	// Keeps a sorted list of all vehicle numbers that ever parked
	static ArrayList<String> sortedVehicleLog = new ArrayList<>();

	// Keeps all current ParkingRecords for Merge Sort display
	static ArrayList<ParkingRecord> allRecords = new ArrayList<>();


	// INITIALIZATION: Fill the Min-Heap with all slot indices
	static {
		for (int i = 0; i < totalSlots; i++) {
			availableSlots.add(i); // slots 0..9 all available at start
		}
	}

	// METHOD: isValid(String vehicleNo)
	// Validates Indian vehicle number format: XX00XX0000
	public static boolean isValid(String v) {

		// Length must be exactly 10
		if (v.length() != 10) return false;

		// First 2 chars must be letters (State code e.g. MH, KA)
		if (!Character.isLetter(v.charAt(0)) || !Character.isLetter(v.charAt(1)))
			return false;

		// Next 2 chars must be digits (District code e.g. 12)
		if (!Character.isDigit(v.charAt(2)) || !Character.isDigit(v.charAt(3)))
			return false;

		// Next 2 chars must be letters (Series e.g. AB)
		if (!Character.isLetter(v.charAt(4)) || !Character.isLetter(v.charAt(5)))
			return false;

		// Last 4 chars must be digits (Unique number e.g. 1234)
		for (int i = 6; i < 10; i++) {
			if (!Character.isDigit(v.charAt(i))) return false;
		}

		return true;
	}

	// METHOD: parkVehicle(String vehicleNo)
	// DSA USED: Min-Heap (PriorityQueue) + HashMap + Stack
	public static void parkVehicle(String vehicleNo) {

		// Check if vehicle is already parked
		if (vehicleMap.containsKey(vehicleNo)) {
			System.out.println(" [!] Vehicle " + vehicleNo + " is already parked in Slot "
					+ (vehicleMap.get(vehicleNo).slotIndex + 1));
			return;
		}

		// If parking is full → add to WAITING QUEUE (DSA 4)
		if (availableSlots.isEmpty()) {
			waitingQueue.add(vehicleNo);
			System.out.println(" [FULL] Parking full! Vehicle " + vehicleNo
					+ " added to waiting queue. Position: " + waitingQueue.size());
			return;
		}

		// DSA 1: Poll from Min-Heap → gives the SMALLEST (nearest) slot index
		int assignedSlot = availableSlots.poll();

		// Record entry time
		long entryTime = System.currentTimeMillis();

		// Update slot array
		parkingSlots[assignedSlot] = vehicleNo;

		// Create a parking record
		ParkingRecord record = new ParkingRecord(vehicleNo, assignedSlot, entryTime);

		// DSA 2: Store in HashMap for O(1) lookup
		vehicleMap.put(vehicleNo, record);

		// DSA 3: Push to Stack for undo support
		undoStack.push(record);

		// Add to sorted log (for Binary Search)
		insertSorted(vehicleNo);

		// Add to records list (for Merge Sort)
		allRecords.add(record);

		System.out.println(" [PARKED] Vehicle " + vehicleNo
				+ " → Slot " + (assignedSlot + 1));
	}


	// METHOD: removeVehicle(Scanner sc)
	// DSA USED: HashMap + Min-Heap
	public static void removeVehicle(Scanner sc) {

		System.out.print(" Enter vehicle number to remove: ");
		String vehicleNo = sc.nextLine().trim().toUpperCase();

		// DSA 2: O(1) lookup in HashMap
		if (!vehicleMap.containsKey(vehicleNo)) {
			System.out.println(" [!] Vehicle " + vehicleNo + " not found in parking.");
			return;
		}

		ParkingRecord record = vehicleMap.get(vehicleNo);
		int slotIndex = record.slotIndex;

		// Free the slot in array
		parkingSlots[slotIndex] = null;

		// Remove from HashMap
		vehicleMap.remove(vehicleNo);

		// Remove from allRecords list
		allRecords.removeIf(r -> r.vehicleNumber.equals(vehicleNo));

		// DSA 1: Return slot back to Min-Heap so it's available again
		availableSlots.add(slotIndex);

		// Calculate parking duration
		long duration = (System.currentTimeMillis() - record.entryTime) / 1000;
		System.out.println(" [REMOVED] Vehicle " + vehicleNo
				+ " removed from Slot " + (slotIndex + 1)
				+ ". Duration: " + duration + " seconds.");

		// DSA 4: If someone is waiting in Queue, park them now
		if (!waitingQueue.isEmpty()) {
			String nextVehicle = waitingQueue.poll(); // FIFO: first in, first out
			System.out.println(" [QUEUE] Slot freed! Parking waiting vehicle: " + nextVehicle);
			parkVehicle(nextVehicle);
		}
	}

	// METHOD: undoLastParking()
	// DSA USED: Stack (LIFO undo)
	public static void undoLastParking() {

		// DSA 3: Stack.isEmpty() check
		if (undoStack.isEmpty()) {
			System.out.println(" [!] Nothing to undo.");
			return;
		}

		// Pop the last parked vehicle
		ParkingRecord last = undoStack.pop();

		// Only undo if the vehicle is still parked (not already removed)
		if (!vehicleMap.containsKey(last.vehicleNumber)) {
			System.out.println(" [!] Last action already reversed.");
			return;
		}

		// Free the slot
		parkingSlots[last.slotIndex] = null;
		vehicleMap.remove(last.vehicleNumber);
		allRecords.removeIf(r -> r.vehicleNumber.equals(last.vehicleNumber));
		availableSlots.add(last.slotIndex); // return to Min-Heap

		System.out.println(" [UNDO] Removed " + last.vehicleNumber
				+ " from Slot " + (last.slotIndex + 1));
	}

	
	// METHOD: searchVehicle(String vehicleNo)
	// DSA USED: Binary Search on sorted log — O(log n)
	public static void searchVehicle(String vehicleNo) {

		// Binary search on sorted ArrayList of all vehicle numbers
		int result = Collections.binarySearch(sortedVehicleLog, vehicleNo);

		if (result >= 0 && vehicleMap.containsKey(vehicleNo)) {
			// Vehicle found and still parked
			ParkingRecord record = vehicleMap.get(vehicleNo);
			System.out.println(" [FOUND] " + record);
		} else {
			System.out.println(" [NOT FOUND] Vehicle " + vehicleNo
					+ " is not currently parked.");
		}
	}

	// METHOD: displaySorted()
	// DSA USED: Merge Sort on ParkingRecord list by entry time
	// Shows currently parked vehicles sorted by entry time
	public static void displaySorted() {

		if (allRecords.isEmpty()) {
			System.out.println(" No vehicles currently parked.");
			return;
		}

		// Create a copy so we don't disturb original list
		ArrayList<ParkingRecord> sorted = new ArrayList<>(allRecords);

		// DSA 6: Merge Sort by entry time (ascending)
		mergeSort(sorted, 0, sorted.size() - 1);

		System.out.println("\n Vehicles sorted by Entry Time (oldest first):");
		System.out.println(" " + "-".repeat(55));
		for (ParkingRecord r : sorted) {
			System.out.println(" " + r);
		}
		System.out.println(" " + "-".repeat(55));
	}

	// METHOD: displayStatus()
	// Shows all slot statuses + waiting queue
	public static void displayStatus() {

		System.out.println("\n " + "=".repeat(40));
		System.out.println(" PARKING STATUS");
		System.out.println(" " + "=".repeat(40));

		int occupied = 0;

		for (int i = 0; i < totalSlots; i++) {
			System.out.print(" Slot " + String.format("%2d", (i + 1)) + ": ");
			if (parkingSlots[i] == null) {
				System.out.println("[ EMPTY ]");
			} else {
				System.out.println("[ " + parkingSlots[i] + " ]");
				occupied++;
			}
		}

		System.out.println(" " + "-".repeat(40));
		System.out.println(" Occupied: " + occupied + " / " + totalSlots);
		System.out.println(" Available Slots in Heap: " + availableSlots.size());

		// Show waiting queue
		if (!waitingQueue.isEmpty()) {
			System.out.println(" Waiting Queue: " + waitingQueue);
		} else {
			System.out.println(" Waiting Queue: Empty");
		}

		System.out.println(" " + "=".repeat(40));
	}

	
	// HELPER: insertSorted(String vehicleNo)
	// Inserts vehicle number into sorted log maintaining order
	// Needed so Binary Search works correctly
	private static void insertSorted(String vehicleNo) {

		int pos = Collections.binarySearch(sortedVehicleLog, vehicleNo);

		// binarySearch returns -(insertion point) - 1 if not found
		if (pos < 0) {
			pos = -(pos + 1);
		}
		sortedVehicleLog.add(pos, vehicleNo);
	}


	
	// DSA 6: MERGE SORT
	// Sorts ArrayList<ParkingRecord> by entryTime ascending
	// Time Complexity: O(n log n) — best for large datasets
	private static void mergeSort(ArrayList<ParkingRecord> list, int left, int right) {

		if (left >= right) return; // base case: single element

		int mid = (left + right) / 2;

		mergeSort(list, left, mid); // sort left half
		mergeSort(list, mid + 1, right); // sort right half
		merge(list, left, mid, right); // merge both halves
	}

	private static void merge(ArrayList<ParkingRecord> list, int left, int mid, int right) {

		// Temporary lists for left and right halves
		ArrayList<ParkingRecord> leftList = new ArrayList<>(list.subList(left, mid + 1));
		ArrayList<ParkingRecord> rightList = new ArrayList<>(list.subList(mid + 1, right + 1));

		int i = 0, j = 0, k = left;

		// Merge by comparing entryTime
		while (i < leftList.size() && j < rightList.size()) {
			if (leftList.get(i).entryTime <= rightList.get(j).entryTime) {
				list.set(k++, leftList.get(i++));
			} else {
				list.set(k++, rightList.get(j++));
			}
		}

		// Copy remaining elements
		while (i < leftList.size()) list.set(k++, leftList.get(i++));
		while (j < rightList.size()) list.set(k++, rightList.get(j++));
	}
}

//CLASS: Main
public class Main {

	public static void main(String[] args) {

		Scanner sc = new Scanner(System.in);

		System.out.println("\n ╔═══════════════════════════╗");
		System.out.println(" ║ SMART PARKING SYSTEM ");
		System.out.println(" ╠═══════════════════════════╣");


		ParkingSystem obj = new ParkingSystem();
		int choice;

		// MAIN MENU LOOP
		do {
			System.out.println("\n ┌─────────────────────────────┐");
			System.out.println(" │ MAIN MENU ");
			System.out.println(" ├─────────────────────────────┤");
			System.out.println(" │ 1. Park a Vehicle ");
			System.out.println(" │ 2. Remove a Vehicle ");
			System.out.println(" │ 3. Display Parking Status ");
			System.out.println(" │ 4. Search Vehicle ");
			System.out.println(" │ 5. Undo Last Parking ");
			System.out.println(" │ 6. View Sorted by Entry ");
			System.out.println(" │ 7. Exit ");
			System.out.println(" └─────────────────────────────┘");
			System.out.print(" Enter your choice: ");

			// Input validation: make sure user enters a number
			while (!sc.hasNextInt()) {
				System.out.print(" [!] Enter a valid number: ");
				sc.next();
			}
			choice = sc.nextInt();
			sc.nextLine(); // consume leftover newline

			System.out.println();

			switch (choice) {

			
			// CASE 1: Park Vehicle
			case 1: {
				String vehicleNo;

				while (true) {
					System.out.print(" Enter vehicle number (format: MH12AB1234): ");
					vehicleNo = sc.nextLine().trim().toUpperCase();

					if (obj.isValid(vehicleNo)) {
						obj.parkVehicle(vehicleNo);
						break; // valid input received, exit loop
					} else {
						System.out.println(" [!] Invalid format. Use format: MH12AB1234");
					}
				}
				break;
			}

			// CASE 2: Remove Vehicle
			case 2: {
				obj.removeVehicle(sc);
				break;
			}


			// CASE 3: Display full slot status
			case 3: {
				obj.displayStatus();
				break;
			}

			// CASE 4: Search using Binary Search
			case 4: {
				System.out.print(" Enter vehicle number to search: ");
				String searchNo = sc.nextLine().trim().toUpperCase();
				obj.searchVehicle(searchNo);
				break;
			}

			// CASE 5: Undo last parked vehicle (Stack)
			case 5: {
				obj.undoLastParking();
				break;
			}

			// CASE 6: Display vehicles sorted by entry time (Merge Sort)
			case 6: {
				obj.displaySorted();
				break;
			}

			// CASE 7: Exit
			case 7: {
				System.out.println(" Thank you for using Smart Parking System. Goodbye!");
				break;
			}

			default: {
				System.out.println("  [!] Invalid option. Please choose 1–7.");
			}
			}

		} while (choice != 7);

		sc.close();
	}
}