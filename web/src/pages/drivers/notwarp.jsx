import React, { useState, useMemo } from "react";
import { Select, Table, Divider, Tag } from "antd";
import mockData from "./mockData";

const columns = [
  { dataIndex: "name", title: "Name", width: 150 },
  { dataIndex: "location", title: "Location (lat, long)", width: 200 },
];

const Drivers = ({ onItemSelect, onItemSelectAll }) => {
  const [selectedNames, setSelectedNames] = useState([]);
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
    const exists = selectedNames.includes(record.name);
    let newNames = exists
      ? selectedNames.filter((n) => n !== record.name)
      : [...selectedNames, record.name];
    setSelectedNames(newNames);

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

    onItemSelectAll &&
      onItemSelectAll(
        filteredData,
        !allSelected,
        newNames.map((name) => mockData.find((i) => i.name === name).key)
      );
  };

  return (
    <Select
      mode="multiple"
      style={{ width: "50%" }}
      placeholder="Add Waypoints"
      value={selectedNames}
      onChange={setSelectedNames}
      showSearch
      onSearch={setSearchText}
      maxTagCount="responsive" // ✅ Auto responsive & wrap
      virtual={false}
      tagRender={(props) => (
        <Tag
          color={mockData.find((i) => i.name === props.label)?.tagColor}
          closable
          onClose={props.onClose}
          style={{
            marginInlineEnd: 4,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {props.label}
        </Tag>
      )}
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
              onSelectAll: handleSelectAll,
            }}
            columns={columns}
            dataSource={filteredData}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ y: 200, x: 350 }}
            virtual
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
