import React, { useState, useEffect, useRef } from "react";
import { Select, Table, Tag } from "antd";
import { createStyles } from "antd-style";
import { CloseOutlined } from "@ant-design/icons";
import { supabase } from "../../../../server/supabase/supabaseClient";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { MapPin, User } from "lucide-react";

const commonStyle = { cursor: "move", transition: "unset", borderRadius: 4 };

const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table-container {
        ${antCls}-table-body {
          max-height: 300px;
          overflow: auto;
          scrollbar-width: thin;
        }
        ${antCls}-table-thead > tr > th {
          background: #fafafa;
          font-weight: 500;
        }
      }
    `,
    activeRow: css`
      background-color: #e6f7ff !important;
    `,
    selectContainer: css`
      ${antCls}-select-selection-overflow {
        gap: 8px !important;
        align-items: flex-start !important;
      }
      ${antCls}-select-selection-overflow-item {
        margin: 2px !important;
        align-self: flex-start !important;
      }
      ${antCls}-select-selector {
        padding: 6px 11px !important;
        min-height: auto !important;
        display: flex !important;
        flex-wrap: wrap !important;
        align-items: flex-start !important;
      }
      ${antCls}-select-selection-search {
        margin: 0 !important;
        align-self: flex-start !important;
      }
      ${antCls}-select-selection-search-input {
        height: 24px !important;
        line-height: 24px !important;
      }
    `,
  };
});

const DraggableTag = ({ tag, onRemove }) => {
  const { listeners, transform, transition, isDragging, setNodeRef } =
    useSortable({ id: tag.id });

  const style = transform
    ? {
        ...commonStyle,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isDragging ? "unset" : transition,
        opacity: isDragging ? 0.8 : 1,
        backgroundColor: isDragging ? "#f0f9ff" : "#ffffff",
        border: isDragging ? "2px dashed #1890ff" : "1px solid #d9d9d9",
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 8px",
        height: 24,
        lineHeight: "16px",
        fontSize: 12,
        margin: 2,
      }
    : {
        ...commonStyle,
        opacity: 1,
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 8px",
        height: 24,
        lineHeight: "16px",
        fontSize: 12,
        margin: 2,
        backgroundColor: "#fafafa",
        border: "1px solid #d9d9d9",
      };

  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Tag
      ref={setNodeRef}
      style={style}
      closable
      onClose={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(tag.id);
      }}
      closeIcon={
        <span
          onMouseDown={onPreventMouseDown}
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: 12,
            color: "#999",
          }}
        >
          <CloseOutlined />
        </span>
      }
    >
      <span
        {...listeners}
        style={{
          display: "inline-flex",
          alignItems: "center",
          cursor: "grab",
          fontSize: 10,
          color: "#666",
          marginRight: 2,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        ⠿
      </span>
      <span style={{ fontSize: 12 }}>{tag.text}</span>
    </Tag>
  );
};

const columns = [
  { title: <User />, dataIndex: "name", key: "name", width: 100 },
  { title: <MapPin />, dataIndex: "location", key: "location" },
];

const WaypointMultiSelect = ({ onUsersSelect }) => {
  const { styles } = useStyle();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNames, setSelectedNames] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeId, setActiveId] = useState(null);
  const tableRef = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data: usersData, error } = await supabase
        .from("users")
        .select("id, name, longitude, latitude, status")
        .not("longitude", "is", null)
        .not("latitude", "is", null);

      if (error) {
        console.error("Error fetching users:", error);
      } else if (usersData) {
        const formatted = usersData.map((u) => ({
          key: u.name,
          name: u.name,
          latitude: u.latitude,
          longitude: u.longitude,
          location: `${u.latitude.toFixed(4)}, ${u.longitude.toFixed(4)}`,
        }));
        setDataSource(formatted);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleSelectionChange = (keys) => {
    setSelectedNames(keys);
    const selectedData = keys
      .map((key) => dataSource.find((item) => item.key === key))
      .filter(Boolean);

    const placeResults = selectedData.map((item) => ({
      name: item.name,
      formatted_address: item.location,
      geometry: {
        location: { lat: item.latitude, lng: item.longitude },
      },
    }));
    onUsersSelect(placeResults);
  };

  const filteredData = dataSource.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const rowSelection = {
    selectedRowKeys: selectedNames,
    onChange: handleSelectionChange,
    preserveSelectedRowKeys: true,
  };

  const handleInputKeyDown = (e) => {
    if (!filteredData.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filteredData.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredData.length) {
        const name = filteredData[activeIndex].name;
        const newSelection = selectedNames.includes(name)
          ? selectedNames.filter((v) => v !== name)
          : [...selectedNames, name];
        handleSelectionChange(newSelection);
      }
    }
  };

  useEffect(() => {
    if (tableRef.current && activeIndex >= 0) {
      const rows = tableRef.current.querySelectorAll("tr.ant-table-row");
      const row = rows[activeIndex];
      if (row) row.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }
    if (active.id !== over.id) {
      const oldIndex = selectedNames.findIndex((item) => item === active.id);
      const newIndex = selectedNames.findIndex((item) => item === over.id);
      const newOrder = arrayMove(selectedNames, oldIndex, newIndex);
      handleSelectionChange(newOrder);
    }
    setActiveId(null);
  };

  const handleRemove = (id) => {
    const updated = selectedNames.filter((item) => item !== id);
    handleSelectionChange(updated);
  };

  const activeItem = selectedNames.find((item) => item === activeId);

  const tagRender = (props) => {
    const { value } = props;
    return (
      <DraggableTag
        key={value}
        tag={{ id: value, text: value }}
        onRemove={handleRemove}
      />
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={selectedNames} strategy={rectSortingStrategy}>
        <Select
          mode="multiple"
          tagRender={tagRender}
          value={selectedNames}
          placeholder="Add team members as waypoints"
          className={styles.selectContainer}
          style={{ width: "100%" }}
          popupRender={() => (
            <div style={{ padding: 8 }} ref={tableRef}>
              <Table
                size="small"
                columns={columns}
                dataSource={filteredData}
                rowKey="name"
                rowSelection={rowSelection}
                pagination={{ pageSize: 10 }}
                scroll={{ y: 55 * 5 }}
                className={styles.customTable}
                rowClassName={(record, index) =>
                  index === activeIndex ? styles.activeRow : ""
                }
                loading={loading}
              />
            </div>
          )}
          styles={{ popup: { root: { zIndex: 999, minWidth: 276 } } }}
          showSearch
          onSearch={setSearchText}
          onChange={handleSelectionChange}
          onInputKeyDown={handleInputKeyDown}
        />
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <Tag
            style={{
              ...commonStyle,
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 8px",
              height: 24,
              lineHeight: "16px",
              fontSize: 12,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,45,0.15)",
              backgroundColor: "#ffffff",
              border: "1px solid #1890ff",
              zIndex: 1000,
            }}
          >
            <span style={{ fontSize: 10, color: "#666", marginRight: 4 }}>
              ⠿
            </span>
            <span>{activeItem}</span>
          </Tag>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default WaypointMultiSelect;
