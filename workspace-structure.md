# Recommended Space Structure

For your Space, I would create these threads/folders in this exact order:

1. **PRD & Vision**

   * Product vision
   * User stories
   * Roadmap
   * Success metrics

2. **System Architecture**

   * Overall architecture
   * Domain model
   * Event flows
   * Offline strategy

3. **Flask Backend**

   * REST API
   * WebSockets
   * Device discovery
   * Manufacturer adapters

4. **Device Abstraction Layer**

   * Common device schema
   * Capability model
   * Matter-ready mapping

5. **React Native Frontend**

   * Expo Router
   * Zustand
   * React Query
   * App structure

6. **Three.js House Renderer**

   * House model format
   * Room rendering
   * Camera controls
   * Device overlays

7. **Design System & UI**

   * Colors
   * Typography
   * Components
   * Motion
   * PT-PT copy

8. **Device Management**

   * Discovery
   * Pairing
   * Editing
   * Room assignment

9. **Automation Engine**

   * Rules
   * Triggers
   * Conditions
   * Actions

10. **Alerts & Notifications**

    * Alert model
    * Severity levels
    * Notification center

11. **Voice & Alexa Future**

    * Alexa bridge
    * Intent mapping
    * Voice announcements

12. **Local AI Agent**

    * Voice assistant
    * LLM integration
    * Conversational control

13. **Tablet Hardware Comparison**

    * Android tablets
    * iPads
    * Thermal analysis
    * Longevity

14. **Deployment & Kiosk Mode**

    * Android kiosk
    * iPad guided access
    * Auto-launch
    * Recovery

15. **Performance & 24/7 Reliability**

    * Watchdogs
    * Caching
    * Reconnection
    * Memory management

16. **Testing & QA**

    * Unit tests
    * Integration tests
    * Tablet tests
    * Long-duration soak testing

With the two skills together:

* **smart-home-control-center-architect** → architecture, APIs, backend, data models, scalability.
* **smart-home-ui-designer** → UX, design system, React Native screens, Three.js visualizations, animations, PT-PT interface copy.

Perplexity can then automatically combine both skills when you ask things like: *"Design the device details screen and generate the React Native implementation"* or *"Create the 3D house dashboard architecture and UI."*
