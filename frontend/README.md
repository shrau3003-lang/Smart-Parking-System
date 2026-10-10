# SmartPark Dashboard

Create a complete, modern, professional, and fully interactive web UI for my college project, “Smart Parking Management System”.

PROJECT BACKGROUND:

My existing project is written in Java. It uses data structures and algorithms such as HashMap for vehicle-to-slot mapping, PriorityQueue for parking slot allocation, Stack for undo operations, LinkedList for the waiting queue, and searching/sorting for parking records. I want a frontend that represents these project features clearly. Build the UI first. Do not replace my existing Java project or claim that the frontend is already connected to it.

TECHNOLOGY:

Use React, TypeScript, Tailwind CSS, and Lucide icons. Use reusable components and clean, maintainable code. Use localStorage and shared frontend state for a functional demonstration. Keep the code organized so it can later connect to my existing Java backend through REST APIs. Do not create a Python backend.

DESIGN THEME:

Create a premium, clean, modern smart-mobility dashboard. Use the same color palette consistently throughout every page.

- Dark navy #102A43 for the sidebar and primary navigation.

- Deep blue #243B53 for secondary surfaces.

- Emerald green #16A34A for primary buttons and available parking slots.

- Light green #DCFCE7 for success backgrounds.

- White #FFFFFF for cards and panels.

- Light gray #F4F7FA for the page background.

- Dark slate #172B4D for primary text.

- Muted gray #627D98 for secondary text.

- Red for occupied parking slots.

- Amber for reserved parking slots.

- Neutral gray for maintenance slots.

Use readable typography, consistent spacing, subtle shadows, rounded corners, clean icons, restrained animations, and accessible color contrast. Avoid excessive gradients, clutter, and unnecessary decoration.

GLOBAL LAYOUT:

Create a collapsible dark navy sidebar with a parking logo and the name “SmartPark”. Include navigation for Dashboard, Parking Slots, Vehicle Management, Waiting Queue, Parking History, Undo Activity, Analytics, and Settings.

Add a top navigation bar containing the current page title, breadcrumb, global vehicle search, notification icon, and administrator profile. Make the layout responsive for desktop, tablet, and mobile.

1. DASHBOARD:

Create a professional overview page with summary cards for Total Slots, Available Slots, Occupied Slots, Reserved Slots, Occupancy Rate, Vehicles Parked, and Vehicles in Queue.

Include a visual parking occupancy overview, daily vehicle entry and exit chart, vehicle-type distribution chart, recent activity table, and quick-action buttons for Park Vehicle, Remove Vehicle, Find Vehicle, and View Parking Slots.

Use realistic, clearly identified demo data. Calculate summary values from the shared application state rather than hardcoding inconsistent totals.

2. PARKING SLOTS:

Create an interactive parking lot layout with zones such as A, B, and C and numbered slots such as A01, A02, A03, B01, and B02.

Display each slot as a card with a clear status and color:

- Green: Available

- Red: Occupied

- Amber: Reserved

- Gray: Under Maintenance

Add a legend, search, zone filter, status filter, and vehicle-type filter. Clicking a slot must open a detail panel showing its slot number, status, assigned vehicle, entry time, and available actions.

Allow the user to park a vehicle in an available slot and release an occupied slot through a confirmation dialog.

3. VEHICLE MANAGEMENT:

Create a searchable, sortable, paginated vehicle table with registration number, vehicle type, owner name, contact number, parking slot, entry time, and current status.

Support Cars, Bikes, SUVs, and Electric Vehicles.

Provide functional Add Vehicle, Park Vehicle, View Details, and Remove Vehicle actions. Use modal forms with validation and clear success/error messages. Prevent duplicate active parking records for the same vehicle.

4. PARK AND REMOVE VEHICLES:

Create a dedicated workflow for parking and exiting vehicles.

The Park Vehicle form should collect registration number, vehicle type, owner name, and contact number. Display available slots and recommend a suitable slot. Let the administrator confirm the assignment.

On successful parking, update the vehicle list, slot grid, dashboard counters, activity feed, and parking history consistently.

The Remove Vehicle workflow must confirm the action, record the exit time and parking duration, mark the slot available, and update all related pages.

Show an understandable message when no slots are available.

5. WAITING QUEUE:

Create a queue page displaying queue position, vehicle registration number, vehicle type, arrival time, and waiting duration.

Include Add to Queue, View Details, and Remove from Queue actions.

Clearly highlight the next vehicle to be served. Follow first-in-first-out order. When a slot becomes available, allow the next eligible vehicle to be assigned through a clear action. Do not silently assign occupied or maintenance slots.

6. VEHICLE SEARCH:

Provide a prominent search feature using vehicle registration number.

Display matching vehicle details, current parking status, slot number, entry time, and owner information when available. Show a friendly empty state for unmatched vehicles and allow the search to be cleared.

7. PARKING HISTORY:

Display completed parking sessions with vehicle number, slot number, entry time, exit time, duration, and status.

Include date filters, text search, sorting, pagination, and CSV export if practical. Keep historical records after vehicles exit.

8. UNDO ACTIVITY:

Create an activity history showing recent parking operations, including parking a vehicle, removing a vehicle, and supported slot assignments.

Include action details, timestamps, and an Undo Last Action button.

Implement undo for supported operations by restoring the appropriate previous frontend state. Keep the undo history consistent and prevent unsafe or repeated undo operations. Ask for confirmation before undoing an action.

9. ANALYTICS:

Create a visually attractive analytics page with occupancy trends, vehicle-type distribution, daily entries and exits, peak parking hours, average parking duration, and available-versus-occupied slots.

Use responsive charts with clear titles, labels, and legends. Derive analytics from demo application records where possible. Do not label simulated metrics as live data.

10. SETTINGS:

Create a settings page for parking lot name, slot configuration, zones, supported vehicle types, and administrator profile. Validate form inputs and clearly indicate demo-only settings.

FUNCTIONAL REQUIREMENTS:

- All sidebar links must navigate to the correct pages.

- All buttons, forms, dropdowns, filters, search fields, and confirmation dialogs must work.

- Use shared application state across the entire application.

- Persist demo data in localStorage so changes remain after refreshing the browser.

- Provide initial demo data for parking slots, vehicles, and historical records.

- Ensure the dashboard counts and charts update after actions.

- Prevent parking in occupied, reserved, or maintenance slots.

- Prevent duplicate active parking for the same vehicle.

- Release the assigned slot when a vehicle exits.

- Preserve completed parking sessions in history.

- Use FIFO ordering for the waiting queue.

- Provide input validation, empty states, loading feedback where appropriate, and success/error notifications.

- Use accessible form labels and keyboard-friendly controls.

- Do not leave placeholder buttons or nonfunctional pages.

- Do not fabricate real-time sensor data or claim a real backend connection.

BACKEND INTEGRATION PREPARATION:

Create typed models and a separate service layer for parking slots, vehicles, parking sessions, waiting queue entries, and activity records. Keep mock data operations isolated from the UI components so the mock service can later be replaced with API requests to a Java backend. The current frontend must work without a backend.

Do not automatically introduce MySQL, Firebase, Supabase, authentication, or unrelated services. Do not rewrite the existing Java data structures in another language and claim they are connected. Backend integration will be done separately after the UI is completed.

FINAL DELIVERABLE:

Generate the complete working frontend, not just a landing page or static design. Ensure every page uses the same navy, emerald green, white, and light-gray theme. Make the dashboard and parking-slot visualization the main highlights. Prioritize a polished, realistic, easy-to-demonstrate UI suitable for a college DSA project presentation and viva.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/61fb5c86-adb8-4979-b4c0-147d674eb6c0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
