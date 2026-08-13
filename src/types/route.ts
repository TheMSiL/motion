/** A single point of a recorded or planned route, in normalised map space. */
export interface RoutePoint {
  /** 0–100, left to right within the map viewport. */
  x: number
  /** 0–100, top to bottom within the map viewport. */
  y: number
}

export interface RouteWaypoint extends RoutePoint {
  label: string
}

export interface Route {
  id: string
  /** Ordered polyline describing the whole path. */
  points: RoutePoint[]
  /** Named stops along the way, shown as markers on the map. */
  waypoints: RouteWaypoint[]
  startLabel: string
  endLabel: string
  /** Total climb in metres. */
  elevationGain: number
  /** Per-kilometre elevation profile, used by the detail chart. */
  elevationProfile: number[]
}
