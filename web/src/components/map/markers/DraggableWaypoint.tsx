import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Row, Col, Button, Tooltip, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { GripVertical } from "lucide-react";

export function DraggableWaypoint({ waypoint, index, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: waypoint.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        style={{
          marginBottom: 8,
          border: isDragging ? "2px dashed #1890ff" : "1px solid #d9d9d9",
          backgroundColor: isDragging ? "#f0f9ff" : "#ffffff",
        }}
        bodyStyle={{ padding: "12px" }}
      >
        <Row align="middle" gutter={[12, 0]}>
          <Col>
            <div
              {...attributes}
              {...listeners}
              style={{
                cursor: isDragging ? "grabbing" : "grab",
                color: "#8c8c8c",
                fontSize: "14px",
                padding: "4px",
              }}
            >
              <GripVertical size={16} />
            </div>
          </Col>

          <Col>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: "#1890ff",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {index + 1}
            </div>
          </Col>

          <Col flex="auto">
            <div>
              <span style={{ fontSize: "14px" }}>
                {waypoint.name || waypoint.formatted_address}
              </span>
            </div>
          </Col>

          <Col>
            <Space size="small">
              <Tooltip title="Remove waypoint">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(waypoint.id)}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
