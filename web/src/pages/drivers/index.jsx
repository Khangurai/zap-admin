import React, { useState, useMemo } from "react";
import { Select, Tag, Table, Divider } from "antd";

// Ant Design preset colors
const presetColors = [
  "magenta", "red", "volcano", "orange", "gold",
  "lime", "green", "cyan", "blue", "geekblue", "purple"
];

// Data with random tag colors
const mockData = [
  { key: "TEAM194", name: "Aung Kyaw", location: "16.776474, 96.171004" },
  { key: "TEAM432", name: "Kyaw Thaung", location: "16.77122, 96.175772" },
  { key: "TEAM820", name: "Zaw Min", location: "16.776539, 96.168959" },
  { key: "TEAM286", name: "Mya Hnin", location: "16.778781, 96.16733" },
  { key: "TEAM698", name: "Ko Ko", location: "16.78585, 96.161588" },
  { key: "TEAM851", name: "Aye Chan", location: "16.786012, 96.14788" },
  { key: "TEAM344", name: "Soe Win", location: "16.779877, 96.143969" },
  { key: "TEAM289", name: "Hla Hla", location: "16.780137, 96.13744" },
  { key: "TEAM570", name: "Thura", location: "16.780642, 96.131666" },
  { key: "TEAM517", name: "Than Myint", location: "16.793038, 96.122994" },
  { key: "TEAM363", name: "Moe Moe", location: "16.802123, 96.122292" },
  { key: "TEAM627", name: "Aung Aung", location: "16.803815, 96.12437" },
  { key: "TEAM795", name: "Khin Khin", location: "16.803723, 96.133336" },
  { key: "TEAM544", name: "Nay Lin", location: "16.804693, 96.133012" },
  { key: "TEAM719", name: "Wai Yan", location: "16.815558, 96.128566" },
].map(item => ({
  ...item,
  tagColor: presetColors[Math.floor(Math.random() * presetColors.length)]
}));

// Table columns
const columns = [
  { dataIndex: "name", title: "Name", width: 150 },
  { dataIndex: "location", title: "Location (lat, long)", width: 200 },
];

// Custom tag render for Select
const tagRender = ({ label, value, closable, onClose }) => {
  const item = mockData.find((i) => i.key === value);
  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      color={item ? item.tagColor : "blue"}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginInlineEnd: 4 }}
    >
      {item ? item.name : label}
    </Tag>
  );
};

const Drivers = ({ onItemSelect, onItemSelectAll }) => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [searchText, setSearchText] = useState("");

  const filteredData = useMemo(() => {
    if (!searchText) return mockData;
    return mockData.filter(
      (item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.location.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const handleRowSelect = (record) => {
    const exists = selectedKeys.includes(record.key);
    let newKeys = exists
      ? selectedKeys.filter((k) => k !== record.key)
      : [...selectedKeys, record.key];
    setSelectedKeys(newKeys);
    onItemSelect && onItemSelect(record, !exists, newKeys);
  };

  const handleSelectAll = () => {
    const filteredKeys = filteredData.map((d) => d.key);
    const allSelected = filteredKeys.every((key) => selectedKeys.includes(key));
    let newKeys = allSelected
      ? selectedKeys.filter((k) => !filteredKeys.includes(k))
      : Array.from(new Set([...selectedKeys, ...filteredKeys]));
    setSelectedKeys(newKeys);
    onItemSelectAll && onItemSelectAll(filteredData, !allSelected, newKeys);
  };

  return (
    <Select
      mode="multiple"
      style={{ width: 500 }}
      placeholder="Add Waypoints"
      value={selectedKeys}
      tagRender={tagRender}
      onChange={(keys) => setSelectedKeys(keys)}
      showSearch
      onSearch={(value) => setSearchText(value)}
      dropdownRender={() => (
        <div style={{ padding: 4, maxHeight: 300, overflowY: "auto", width: 500 }}>
          <div
            style={{
              padding: "4px 8px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              {selectedKeys.length}/{mockData.length} items selected
            </span>
          </div>
          <Divider style={{ margin: "4px 0" }} />
          <Table
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onSelect: handleRowSelect,
              onSelectAll: () => handleSelectAll(),
            }}
            columns={columns}
            dataSource={filteredData}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ y: 200 }}
            onRow={(record) => ({
              onClick: () => handleRowSelect(record),
              tabIndex: 0,
            })}
          />
        </div>
      )}
    />
  );
};

export default Drivers;
