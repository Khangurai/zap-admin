import React, { useEffect, useState, useRef } from "react";
import {
  Space,
  Table,
  Tag,
  Switch,
  Popconfirm,
  Button,
  message,
  Input,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { supabase } from "../../../server/supabase/supabaseClient";
import "./style.css";

const UserList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Real-time search function
  const handleSearch = (value) => {
    setSearchText(value);
    if (value) {
      const filtered = data.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const handleDelete = async (id) => {
    setDeleteLoadingId(id);
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
      setData((prev) => prev.filter((item) => item.id !== id));
      setFilteredData((prev) => prev.filter((item) => item.id !== id));
      message.success("User deleted successfully");
    } catch (error) {
      message.error(`Error deleting user: ${error.message}`);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleToggleActive = async (id, checked) => {
    const previousData = [...data];
    const previousFilteredData = [...filteredData];

    const updateData = (prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: checked } : user
      );

    setData(updateData);
    setFilteredData(updateData);

    try {
      const { error } = await supabase
        .from("users")
        .update({ status: checked })
        .eq("id", id);
      if (error) throw error;
      message.success("User status updated");
    } catch (error) {
      setData(previousData);
      setFilteredData(previousFilteredData);
      message.error(`Failed to update user status: ${error.message}`);
    }
  };

  const columns = [
    { title: "No.", dataIndex: "serial", key: "serial" },
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ whiteSpace: "nowrap" }}>Name</span>
          <Input
            placeholder="Search"
            allowClear
            size="small"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: 150,
              marginLeft: 4,
              padding: "0 8px",
            }}
            prefix={
              <SearchOutlined
                style={{
                  color: "rgba(0,0,0,.25)",
                  fontSize: 12,
                  paddingRight: 4,
                }}
              />
            }
          />
        </div>
      ),
      dataIndex: "name",
      key: "name",
      width: 200, // Fixed width for the column
      render: (text) => <a>{text}</a>,
    },
    { title: "Team Code", dataIndex: "team_code", key: "team_code" },
    { title: "Address (Lat:Long)", dataIndex: "address", key: "address" },
    {
      title: "Tags",
      key: "tags",
      dataIndex: "tags",
      render: (_, { tags }) => (
        <>
          {tags?.map((tag) => {
            let color = tag.length > 5 ? "geekblue" : "green";
            if (tag === "loser") color = "volcano";
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Switch
            checkedChildren="လိုက်မယ်"
            unCheckedChildren="မလိုက်ဘူး"
            checked={record.status}
            onChange={(checked) => handleToggleActive(record.id, checked)}
            disabled={loading}
          />
          <Popconfirm
            title={
              <span>
                Delete the <strong>{record.name}</strong>
              </span>
            }
            description="Are you sure to delete this task?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{
              loading: deleteLoadingId === record.id,
              size: "small",
              style: { marginRight: 8 },
            }}
            cancelButtonProps={{ size: "small" }}
          >
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data: users, error } = await supabase
        .from("users")
        .select(
          `
        id,
        name,
        team_code,
        location,
        longitude,
        latitude,
        status
      `
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching users:", error);
        message.error("Error fetching users");
      } else {
        const formatted = users.map((user, index) => {
          let coords = "";
          if (user.latitude && user.longitude) {
            coords = `📍${user.latitude}, ${user.longitude}`;
          } else if (user.location) {
            try {
              coords = "Coordinates available (needs parsing)";
            } catch (error) {
              console.error("Error parsing location:", error);
              coords = "";
            }
          }

          return {
            key: user.id,
            id: user.id,
            serial: index + 1,
            name: user.name,
            team_code: user.team_code,
            address: coords,
            tags: user.tags || ["member"],
            status: user.status ?? false,
          };
        });

        setData(formatted);
        setFilteredData(formatted);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <Table columns={columns} dataSource={filteredData} loading={loading} />
    </div>
  );
};

export default UserList;
