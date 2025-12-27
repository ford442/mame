# DEVELOPER_CONTEXT.md

## 1. High-Level Architecture & Intent

*   **Core Purpose:** MAME (Multiple Arcade Machine Emulator) is a comprehensive emulation framework designed to preserve software history by documenting hardware through code. It emulates the internal components of arcade machines, consoles, and computers.
*   **Tech Stack:**
    *   **Languages:** C++ (Core, Drivers), Lua (Scripting/Plugins), Python (Build scripts).
    *   **Build System:** Make, Genie (Project generation).
    *   **Rendering:** BGFX, OpenGL, Direct3D, GDI.
    *   **Platform Abstraction:** OSD (Operating System Dependent) layer (SDL for Linux/macOS, Windows native).
    *   **Web:** Emscripten for compiling to WebAssembly/JavaScript.
*   **Design Patterns:**
    *   **Device Model:** Composition over inheritance. Every component (CPU, Sound Chip, Screen) is a `device_t`.
    *   **Delegate Pattern:** Heavy use of delegates for callbacks (e.g., memory read/write handlers).
    *   **Mixins:** Interface classes (e.g., `device_memory_interface`, `device_sound_interface`) provide capabilities to devices.
    *   **Observer:** `machine_notify_delegate` for system events (reset, pause, exit).

## 2. Feature Map (The "General Points")

*   **Core Emulation Loop:**
    *   **Entry:** `running_machine::run` in `src/emu/machine.cpp`.
    *   **Function:** Manages the main scheduler, inputs, video updates, and sound mixing.
*   **Driver System:**
    *   **Entry:** `GAME()` macros in `src/mame/*`.
    *   **Function:** Defines the hardware configuration (CPU, ROMs, Memory Maps) for a specific machine.
*   **Memory Management:**
    *   **Entry:** `address_space` in `src/emu/emumem.cpp`.
    *   **Function:** Handles reading/writing to emulated memory, including memory banking and MMIO.
*   **User Interface (Internal):**
    *   **Entry:** `ui_manager` in `src/frontend/mame/ui/ui.cpp`.
    *   **Function:** Handles the internal menu, file selection, and configuration screens.
*   **Web/Emscripten Support:**
    *   **Entry:** `running_machine::emscripten_main_loop` in `src/emu/machine.cpp`.
    *   **Function:** Bridges the synchronous C++ emulation loop with the asynchronous browser event loop.

## 3. Complexity Hotspots (The "Complex Parts")

*   **Device Scheduler (`src/emu/schedule.cpp`):**
    *   **Why:** Manages the timing of all emulated devices with attosecond precision. It handles timeslicing multiple CPUs and triggering timers.
    *   **Agent Note:** Be extremely careful when modifying `timeslice` or timer allocation logic. Incorrect timing can cause desyncs, audio stuttering, or game freezes.
*   **Memory System (`src/emu/emumem.cpp`):**
    *   **Why:** Supports complex addressing modes, banking, handlers, and dynamic translation. The usage of templates and macros for handler generation is dense.
    *   **Agent Note:** Modifications here affect **every** driver. Ensure you understand the distinction between logical and physical addresses and the specific bus width of the target device.
*   **Emscripten Main Loop (`src/emu/machine.cpp`):**
    *   **Why:** MAME is designed as a blocking loop, but the web is event-driven. The `emscripten_main_loop` function forces MAME to yield execution to the browser every frame (`60Hz`), requiring careful state management to resume correctly.
    *   **Agent Note:** Do not introduce blocking waits (e.g., `while(1)`) in the web build path; it will freeze the browser tab.

## 4. Inherent Limitations & "Here be Dragons"

*   **Known Issues:**
    *   **Save States:** Not all devices support save states (`statename` generation relies on specific device naming conventions). Anonymous timers can block saving.
    *   **Performance:** Accurate simulation is prioritized over speed. Some drivers (e.g., modern 3D systems) are too slow for real-time emulation on average hardware.
*   **Technical Debt:**
    *   **Global State:** While significantly reduced, some legacy global state remains in older drivers or core hacks.
    *   **Macro Magic:** Heavy reliance on C preprocessor macros for memory maps and driver definitions makes static analysis difficult.
*   **Hard Constraints:**
    *   **License:** The project is GPL-2.0+. New files must carry the license header.
    *   **Whitespace:** 4-space tabs are standard. Do not change existing whitespace conventions when modifying files (Keep Allman or K&R style consistent with the specific file).

## 5. Dependency Graph & Key Flows

*   **Emulator Startup:**
    `main()` (OSD) -> `emulator_info` -> `machine_manager::instance()` -> `running_machine` (Constructor) -> `running_machine::start()` -> `start_all_devices()`.
*   **Frame Execution:**
    `running_machine::run()` -> `scheduler.timeslice()` -> `cpu_device::execute_run()` -> `video_manager::frame_update()` -> `osd_interface::update()`.
*   **Web Execution:**
    `emscripten_set_main_loop` -> `emscripten_main_loop` -> `scheduler.timeslice()` (limited duration) -> `video_manager::frame_update()`.
