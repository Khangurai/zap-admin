import React, { useState } from "react";
import { Select, Tag, Table } from "antd";

const mockTags = ["cat", "dog", "bird"];
const mockData = Array.from({ length: 20 }).map((_, i) => ({
  key: i.toString(),
  title: `content${i + 1}`,
  description: `description of content${i + 1}`,
  tag: mockTags[i % 3],
}));

const columns = [
  {
    dataIndex: "title",
    title: "Name",
    width: 120
  },
  {
    dataIndex: "tag",
    title: "Tag",
    width: 80,
    render: (tag) => (
      <Tag style={{ marginInlineEnd: 0 }} color="cyan">
        {tag.toUpperCase()}
      </Tag>
    ),
  },
];

const tagRender = (props) => {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      color="cyan"
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginInlineEnd: 4 }}
    >
      {label}
    </Tag>
  );
};

const Drivers = () => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleRowSelect = (record) => {
    const exists = selectedKeys.includes(record.key);
    if (exists) {
      setSelectedKeys(selectedKeys.filter((k) => k !== record.key));
      setSelectedItems(selectedItems.filter((item) => item.key !== record.key));
    } else {
      setSelectedKeys([...selectedKeys, record.key]);
      setSelectedItems([...selectedItems, record]);
    }
  };

  return (
    <Select
      mode="multiple"
      style={{ width: "100%" }}
      placeholder="Select drivers"
      value={selectedItems.map((item) => item.key)}
      tagRender={(props) => {
        const item = selectedItems.find((i) => i.key === props.value);
        return tagRender({
          ...props,
          label: item ? item.title : props.label,
        });
      }}
      onChange={(keys) => {
        setSelectedKeys(keys);
        setSelectedItems(mockData.filter((d) => keys.includes(d.key)));
      }}
      dropdownRender={() => (
        <div style={{ padding: 4, maxHeight: 200, overflowY: "auto" }}>
          <Table
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onSelect: (record) => handleRowSelect(record),
            }}
            columns={columns}
            dataSource={mockData}
            pagination={false}
            size="small"
            rowKey="key"
            scroll={{ y: 160 }}
          />
        </div>
      )}
    />
  );
};

export default Drivers;
