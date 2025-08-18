Okay, here’s your description fully converted to English 👇

---

For the **initial state**:

* The toggle should be **off** → meaning the route is shown in the **original order of waypoints**.
* When the toggle is **on**, it should mean the **route is optimized** (the waypoint list is reordered by the optimized route).
* So:

  * **On** → waypoints list is ordered by optimized route
  * **Off** → waypoints list is the unordered/original route

---

**Current issues:**

1. In the **team select**, there is a bug:

   * When selecting users a second time, the previously selected users are not cleared.
   * Instead, the old selection is **merged with the new selection**.
   * This needs to be fixed so that new selections replace the old ones.

2. After entering **origin** and **destination**, the directions are not automatically rendered like before.

3. When changing the **origin** or **destination pin**, the directions are also **not re-rendering automatically**.

---

**Expected behavior:**

* Whenever the **toggle state**, **origin**, **destination**, or **waypoints list** changes → the directions should automatically update/render again.

---

Do you want me to help you **fix these issues directly in your `useDirections` and `useMapState` hooks** with code changes?
