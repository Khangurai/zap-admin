The directions render correctly whether the waypoints are optimized or not.
But there’s a bug: when I add waypoints, the directions keep re-rendering multiple times.
Also, when I press Clear Route, the directions path still remains on the map.
Other than that, everything works fine.

The idea is that directions should only be recalculated when the origin/destination on the map is dragged (draggable route), not every time unnecessarily.