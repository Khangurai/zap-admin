import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Input,
  Space,
  Typography,
  Card,
  Divider,
  Table,
  Row,
  Col,
  message,
  Popconfirm,
} from "antd";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Polyline,
  Marker,
} from "@react-google-maps/api";
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  SaveOutlined,
  LinkOutlined,
  AimOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const containerStyle = { width: "100%", height: "420px" };
const defaultCenter = { lat: 16.8409, lng: 96.1735 }; // Yangon

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function RouteOptimizer() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [waypoints, setWaypoints] = useState([]); // [{ id, location }, ...]
  const [directions, setDirections] = useState(null);
  const [totalDistance, setTotalDistance] = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const [routeDetails, setRouteDetails] = useState([]);
  const [geojson, setGeojson] = useState(null);
  const [mapUrl, setMapUrl] = useState("");
  const [waypointOrder, setWaypointOrder] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [path, setPath] = useState([]);
  const [editingEnabled, setEditingEnabled] = useState(false);
  const polylineRef = useRef(null);
  const listenersRef = useRef([]);
  const mapRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Function to shuffle array for random waypoint order
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const decodePolyline = (poly) => {
    let points = [];
    let index = 0,
      lat = 0,
      lng = 0;
    while (index < poly.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = poly.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = poly.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;
      points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
  };

  const buildGoogleMapUrl = useCallback(
    (originStr, destinationStr, allWaypoints, order = []) => {
      const orderedWaypoints = order
        .map((idx) => allWaypoints[idx]?.location)
        .filter(Boolean);
      let url = `https://www.google.com/maps/dir/${encodeURIComponent(
        originStr
      )}/`;
      orderedWaypoints.forEach((pt) => {
        url += `${encodeURIComponent(pt)}/`;
      });
      url += `${encodeURIComponent(destinationStr)}/`;
      return url;
    },
    []
  );

  const fitBoundsToPath = useCallback(() => {
    if (!mapRef.current || !path || path.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    path.forEach((p) => bounds.extend(p));
    mapRef.current.fitBounds(bounds);
  }, [path]);

  useEffect(() => {
    if (path.length) fitBoundsToPath();
  }, [path, fitBoundsToPath]);

  const attachPathListeners = useCallback((polyline) => {
    listenersRef.current.forEach((l) => l.remove());
    listenersRef.current = [];
    if (!polyline) return;
    const mvcPath = polyline.getPath();
    const update = () => {
      const arr = mvcPath
        .getArray()
        .map((ll) => ({ lat: ll.lat(), lng: ll.lng() }));
      setPath(arr);
      const gj = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: arr.map((p) => [p.lng, p.lat]),
        },
        properties: { edited: true },
      };
      setGeojson(gj);
    };
    ["set_at", "insert_at", "remove_at"].forEach((evt) => {
      const listener = mvcPath.addListener(evt, update);
      listenersRef.current.push(listener);
    });
  }, []);

  const onPolylineLoad = useCallback(
    (polyline) => {
      polylineRef.current = polyline;
      attachPathListeners(polyline);
    },
    [attachPathListeners]
  );

  const onPolylineUnmount = useCallback(() => {
    listenersRef.current.forEach((l) => l.remove());
    listenersRef.current = [];
    polylineRef.current = null;
  }, []);

  const optimizeRoute = () => {
    if (!API_KEY) {
      message.error("Google Maps API key is missing.");
      return;
    }
    if (!origin || !destination) {
      message.warning("Origin and Destination are required.");
      return;
    }
    if (!window.google || !window.google.maps) {
      message.error("Google Maps API not loaded yet.");
      return;
    }

    setIsLoading(true);
    const service = new window.google.maps.DirectionsService();
    const cleanWps = waypoints.filter((w) => w.location.trim() !== "");

    service.route(
      {
        origin,
        destination,
        waypoints: cleanWps.map((wp) => ({
          location: wp.location,
          stopover: true,
        })),
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setIsLoading(false);
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          const order = result.routes[0].waypoint_order || [];
          setWaypointOrder(order);

          setDirections(result);

          // Calculate totals and legs
          let totalDist = 0;
          let totalDur = 0;
          const legs = result.routes[0].legs.map((leg, idx) => {
            totalDist += leg.distance.value;
            totalDur += leg.duration.value;
            return {
              key: idx,
              from: leg.start_address,
              to: leg.end_address,
              distance: leg.distance.text,
              duration: leg.duration.text,
            };
          });
          setRouteDetails(legs);
          setTotalDistance((totalDist / 1000).toFixed(2) + " km");
          const hours = Math.floor(totalDur / 3600);
          const minutes = Math.floor((totalDur % 3600) / 60);
          setTotalDuration(`${hours} hours ${minutes} minutes`);

          // Decode polyline for display
          const encoded = result.routes[0].overview_polyline.points;
          const decoded = decodePolyline(encoded).map(([lat, lng]) => ({
            lat,
            lng,
          }));
          setPath(decoded);

          // Generate GeoJSON
          const gj = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: decoded.map((p) => [p.lng, p.lat]),
            },
            properties: { edited: false },
          };
          setGeojson(gj);

          // Build Google Maps URL with optimized order
          const url = buildGoogleMapUrl(origin, destination, cleanWps, order);
          setMapUrl(url);

          // Create markers with labels based on optimized order
          const orderedStops = [
            { position: result.routes[0].legs[0].start_location, label: "O" },
            ...order.map((wpIndex, idx) => ({
              position: result.routes[0].legs[idx + 1]?.start_location,
              label: String(idx + 1), // Label as 1, 2, 3, ... based on optimized order
            })),
            {
              position:
                result.routes[0].legs[result.routes[0].legs.length - 1]
                  .end_location,
              label: "D",
            },
          ].filter((m) => m.position);
          setMarkers(orderedStops);

          message.success("Route optimized.");
        } else {
          message.error("No route found: " + status);
        }
      }
    );
  };

  const addWaypoint = () => {
    setWaypoints((prev) => {
      const newWaypoint = { id: prev.length + 1, location: "" };
      const newWaypoints = [...prev, newWaypoint];
      return shuffleArray(newWaypoints); // Randomize order
    });
  };

  const removeWaypoint = (id) =>
    setWaypoints((prev) => prev.filter((wp) => wp.id !== id));

  const toggleEditing = () => setEditingEnabled((v) => !v);

  const resetEditsToOverview = () => {
    if (!directions) return;
    const encoded = directions.routes[0].overview_polyline.points;
    const decoded = decodePolyline(encoded).map(([lat, lng]) => ({ lat, lng }));
    setPath(decoded);
    const gj = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: decoded.map((p) => [p.lng, p.lat]),
      },
      properties: { edited: false, resetFromOverview: true },
    };
    setGeojson(gj);
    message.info("Polyline reset to overview route.");
  };

  const saveGeoJSONFile = () => {
    if (!geojson) {
      message.warning("Nothing to save yet.");
      return;
    }
    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "route.geojson";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo(
    () => [
      { title: "From", dataIndex: "from" },
      { title: "To", dataIndex: "to" },
      { title: "Distance", dataIndex: "distance" },
      { title: "Duration", dataIndex: "duration" },
    ],
    []
  );

  const mapOptions = useMemo(
    () => ({
      streetViewControl: false,
      fullscreenControl: true,
      mapTypeControl: false,
      gestureHandling: "greedy",
    }),
    []
  );

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <Title level={3}>🚐 Ferry Route Optimizer</Title>
      <Paragraph type="secondary">
        Enter origin, destination, add waypoints (randomly ordered), optimize
        the route, edit the polyline, and export GeoJSON.
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input
              placeholder="Origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
            <Input
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />

            <Divider plain>Waypoints (Random Order)</Divider>
            {waypoints.map((wp) => (
              <Space key={wp.id} style={{ width: "100%" }}>
                <Input
                  placeholder={`Waypoint ${wp.id}`}
                  value={wp.location}
                  onChange={(e) => {
                    const updated = waypoints.map((w) =>
                      w.id === wp.id ? { ...w, location: e.target.value } : w
                    );
                    setWaypoints(updated);
                  }}
                />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeWaypoint(wp.id)}
                />
              </Space>
            ))}
            <Button icon={<PlusOutlined />} onClick={addWaypoint}>
              Add Waypoint
            </Button>

            <Space wrap>
              <Button
                type="primary"
                onClick={optimizeRoute}
                loading={isLoading}
              >
                Optimize Route
              </Button>
              <Button
                icon={<EditOutlined />}
                type={editingEnabled ? "primary" : "default"}
                onClick={toggleEditing}
              >
                {editingEnabled ? "Editing Enabled" : "Enable Editing"}
              </Button>
              <Popconfirm
                title="Reset to original route?"
                onConfirm={resetEditsToOverview}
                disabled={!directions}
              >
                <Button icon={<ReloadOutlined />} disabled={!directions}>
                  Reset Edits
                </Button>
              </Popconfirm>
              <Button
                icon={<SaveOutlined />}
                onClick={saveGeoJSONFile}
                disabled={!geojson}
              >
                Save GeoJSON
              </Button>
              <Button
                icon={<AimOutlined />}
                onClick={fitBoundsToPath}
                disabled={!path.length}
              >
                Fit to Route
              </Button>
            </Space>

            {mapUrl && (
              <Paragraph style={{ marginTop: 8 }}>
                <LinkOutlined />{" "}
                <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                  Open in Google Maps (optimized order)
                </a>
              </Paragraph>
            )}
            {waypointOrder.length > 0 && (
              <Paragraph>
                <strong>Optimized Waypoint Order:</strong>{" "}
                {waypointOrder.map((idx) => waypoints[idx]?.id).join(", ")}
              </Paragraph>
            )}
          </Space>
        </Col>

        <Col xs={24} md={12}>
          <Card>
            <Paragraph>
              <strong>Total Distance:</strong> {totalDistance || "—"}
            </Paragraph>
            <Paragraph>
              <strong>Total Duration:</strong> {totalDuration || "—"}
            </Paragraph>
            <Table
              columns={columns}
              dataSource={routeDetails}
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <LoadScript googleMapsApiKey={API_KEY} libraries={["places"]}>
        <GoogleMap
          onLoad={onMapLoad}
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={12}
          options={mapOptions}
        >
          {directions && <DirectionsRenderer directions={directions} />}
          {path.length > 0 && (
            <Polyline
              path={path}
              editable={editingEnabled}
              draggable={true}
              onLoad={onPolylineLoad}
              onUnmount={onPolylineUnmount}
              onDragEnd={() => {
                if (!polylineRef.current) return;
                const arr = polylineRef.current
                  .getPath()
                  .getArray()
                  .map((ll) => ({ lat: ll.lat(), lng: ll.lng() }));
                setPath(arr);
                const gj = {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: arr.map((p) => [p.lng, p.lat]),
                  },
                  properties: { edited: true, dragEnd: true },
                };
                setGeojson(gj);
              }}
              options={{ strokeOpacity: 0.9, strokeWeight: 5 }}
            />
          )}
          {markers.map((m, i) => (
            <Marker key={i} position={m.position} label={m.label} />
          ))}
        </GoogleMap>
      </LoadScript>

      <Divider />
      <Card title="GeoJSON (live)">
        <Paragraph copyable>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {geojson ? JSON.stringify(geojson, null, 2) : "—"}
          </pre>
        </Paragraph>
      </Card>

      <Divider />
      <Card title="Notes on Safe API Key Handling">
        <ul className="list-disc ml-5">
          <li>
            Put your key in an environment variable:{" "}
            <code>VITE_GOOGLE_MAPS_API_KEY</code> (Vite) or{" "}
            <code>REACT_APP_GOOGLE_MAPS_API_KEY</code> (CRA).
          </li>
          <li>
            Restrict the key in Google Cloud Console to your site via{" "}
            <strong>HTTP referrers</strong> and enable only the{" "}
            <strong>Maps JavaScript API</strong> and{" "}
            <strong>Directions API</strong>.
          </li>
        </ul>
      </Card>
    </div>
  );
}
