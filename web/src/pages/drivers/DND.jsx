import React, { useState, useMemo } from "react";
import { Select, Table, Divider, Tag, Flex } from "antd";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";

// ✅ Import mock data from external file
import mockData from "./mockData"; // သင့် path အလိုက်ပြင်ပါ

// Table columns
const columns = [
  { dataIndex: "name", title: "Name" },
  { dataIndex: "location", title: "Location (lat, long)" },
];

// Draggable tag component
const DraggableTag = ({ tag, onClose }) => {
  const { listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tag.key });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isDragging ? "unset" : transition,
        cursor: "move",
        marginInlineEnd: 4,
      }
    : { cursor: "move", marginInlineEnd: 4 };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose(tag);
  };

  return (
    <Tag
      color={tag.tagColor}
      ref={setNodeRef}
      {...listeners}
      style={style}
      closable
      onClose={handleClose}
      onClick={(e) => e.stopPropagation()}
    >
      {tag.name}
    </Tag>
  );
};

const Drivers = ({ onItemSelect, onItemSelectAll }) => {
  const [selectedNames, setSelectedNames] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchText, setSearchText] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  const filteredData = useMemo(() => {
    if (!searchText) return mockData;
    return mockData.filter(
      (item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.location.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const handleRowSelect = (record) => {
    const exists = selectedNames.includes(record.name);
    let newNames = exists
      ? selectedNames.filter((n) => n !== record.name)
      : [...selectedNames, record.name];
    setSelectedNames(newNames);

    const newTags = newNames.map((name) =>
      mockData.find((i) => i.name === name)
    );
    setSelectedTags(newTags);

    onItemSelect &&
      onItemSelect(
        record,
        !exists,
        newNames.map((name) => mockData.find((i) => i.name === name).key)
      );
  };

  const handleSelectAll = () => {
    const filteredNames = filteredData.map((d) => d.name);
    const allSelected = filteredNames.every((name) =>
      selectedNames.includes(name)
    );
    let newNames = allSelected
      ? selectedNames.filter((n) => !filteredNames.includes(n))
      : Array.from(new Set([...selectedNames, ...filteredNames]));
    setSelectedNames(newNames);

    const newTags = newNames.map((name) =>
      mockData.find((i) => i.name === name)
    );
    setSelectedTags(newTags);

    onItemSelectAll &&
      onItemSelectAll(
        filteredData,
        !allSelected,
        newNames.map((name) => mockData.find((i) => i.name === name).key)
      );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = selectedTags.findIndex((t) => t.key === active.id);
      const newIndex = selectedTags.findIndex((t) => t.key === over.id);
      const newTags = arrayMove(selectedTags, oldIndex, newIndex);
      setSelectedTags(newTags);
      setSelectedNames(newTags.map((t) => t.name));
    }
  };

  const handleTagClose = (tag) => {
    const newNames = selectedNames.filter((n) => n !== tag.name);
    setSelectedNames(newNames);
    setSelectedTags(
      newNames.map((name) => mockData.find((i) => i.name === name))
    );
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <Select
        mode="multiple"
        style={{ width: "50%" }}
        placeholder="Add Waypoints"
        value={selectedNames}
        onChange={(names) => {
          setSelectedNames(names);
          setSelectedTags(
            names.map((name) => mockData.find((i) => i.name === name))
          );
        }}
        showSearch
        onSearch={(value) => setSearchText(value)}
        maxTagCount="responsive"
        virtual={false} // ✅ Disable virtual scroll (or set true to enable) to fix warning
        maxTagPlaceholder={(omittedValues) => (
          <SortableContext
            items={selectedTags.map((t) => t.key)}
            strategy={horizontalListSortingStrategy}
          >
            <Flex wrap gap="4px 0px" style={{ display: "inline-flex" }}>
              {selectedTags.map((tag) => (
                <DraggableTag
                  tag={tag}
                  key={tag.key}
                  onClose={handleTagClose}
                />
              ))}
            </Flex>
          </SortableContext>
        )}
        tagRender={(props) => {
          const tag = selectedTags.find((t) => t.name === props.label);
          if (!tag) return null;

          return (
            <SortableContext
              items={selectedTags.map((t) => t.key)}
              strategy={horizontalListSortingStrategy}
            >
              <DraggableTag tag={tag} key={tag.key} onClose={handleTagClose} />
            </SortableContext>
          );
        }}
        dropdownRender={() => (
          <div
            style={{
              padding: 4,
              maxHeight: 300,
              overflowY: "auto",
              width: 500,
            }}
          >
            <div
              style={{
                padding: "4px 8px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                {selectedNames.length}/{mockData.length} items selected
              </span>
            </div>
            <Divider style={{ margin: "4px 0" }} />
            <Table
              rowSelection={{
                selectedRowKeys: selectedNames.map(
                  (name) => mockData.find((i) => i.name === name).key
                ),
                onSelect: handleRowSelect,
                onSelectAll: () => handleSelectAll(),
              }}
              columns={columns}
              dataSource={filteredData}
              pagination={false}
              size="small"
              rowKey="key"
              // ✅ Virtual Scroll ကိုဖွင့်ပေးခြင်း (Big Data အတွက် အရမ်းအရေးကြီး)
              scroll={{ y: 200, x: 350 }}
              virtual // ✅ Table အတွက် virtualization ဖွင့်ပေးခြင်း
              onRow={(record) => ({
                onClick: () => handleRowSelect(record),
                tabIndex: 0,
              })}
            />
          </div>
        )}
      />
    </DndContext>
  );
};

export default Drivers;
