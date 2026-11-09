# Browser edition architecture
The existing `gloamgear/index.html` contains the independent game state, derived statistics,
combat simulation, UI and Canvas combat effects. Renderer and simulation are not yet separate
TypeScript packages. The test harness executes the actual simulation in Node's VM without a browser.
Assets are served from the same origin. Only the active world scenery and next world are loaded.
Persistence uses a versioned localStorage snapshot with input sanitization, last-known-valid backup,
autosave, visibility/pagehide saves and recovery. It is single-device, not server-authoritative.
Service Worker supplies a network-first cache for visited files. No runtime third-party dependencies.
This is an independently deployable browser edition, not the requested full online architecture.
