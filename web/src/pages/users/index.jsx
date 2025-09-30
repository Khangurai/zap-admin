import React, { useEffect, useState } from "react";
import {
  Space,
  Table,
  Tag,
  Switch,
  Popconfirm,
  Button,
  message,
  Input,
  Form,
  Modal,
} from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { supabase } from "../../../server/supabase/supabaseClient";
import "./style.css";

const UserList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [editingKey, setEditingKey] = useState("");
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  // Real-time search function (name + username)
  const handleSearch = (value) => {
    setSearchText(value);
    if (value) {
      const lowerValue = value.toLowerCase();
      const filtered = data.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerValue) ||
          item.username.toLowerCase().includes(lowerValue)
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const isEditing = (record) => record.id === editingKey;

  const edit = (record) => {
    form.setFieldsValue({ name: "", username: "", ...record });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (id, username) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => id === item.id);

      if (index > -1) {
        const item = newData[index];

        // Parse address
        let latitude = null;
        let longitude = null;
        let coords = "No coordinates";

        if (row.address) {
          const addressString = row.address.replace("📍", "").trim();
          if (addressString && addressString.toLowerCase() !== "no coordinates") {
            const parts = addressString.split(",").map((s) => s.trim());
            if (parts.length === 2) {
              const lat = parseFloat(parts[0]);
              const lon = parseFloat(parts[1]);
              if (!isNaN(lat) && !isNaN(lon)) {
                latitude = lat;
                longitude = lon;
                coords = `📍${latitude}, ${longitude}`;
              }
            }
          }
        }

        const updatedUser = { ...item, ...row, address: coords };

        // update supabase
        const { error } = await supabase
          .from("users")
          .update({
            name: row.name,
            username: row.username,
            phone: row.phone,
            latitude: latitude,
            longitude: longitude,
          })
          .eq("id", id)
          .eq("username", username);

        if (error) {
          console.error("Supabase Update Error:", error);
          throw error;
        }

        newData.splice(index, 1, updatedUser);
        setData(newData);
        setFilteredData(newData);
        setEditingKey("");
        message.success("User updated successfully");
      }
    } catch (err) {
      console.error("Validate Failed:", err);
      message.error("Failed to update user");
    }
  };

  const handleDelete = async (id, username) => {
    setDeleteLoadingId(id);
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id)
        .eq("username", username);

      if (error) {
        console.error("Supabase Delete Error:", error);
        throw error;
      }

      setData((prev) => prev.filter((item) => item.id !== id));
      setFilteredData((prev) => prev.filter((item) => item.id !== id));
      message.success("User deleted successfully");
    } catch (error) {
      message.error(`Error deleting user: ${error.message}`);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleToggleActive = async (id, username, checked) => {
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
        .eq("id", id)
        .eq("username", username);

      if (error) {
        console.error("Supabase Status Update Error:", error);
        throw error;
      }

      message.success("User status updated");
    } catch (error) {
      setData(previousData);
      setFilteredData(previousFilteredData);
      message.error(`Failed to update user status: ${error.message}`);
    }
  };

  const handleCreateUser = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await createForm.validateFields();
      const { data: newUser, error } = await supabase
        .from("users")
        .insert([
          {
            name: values.name,
            username: values.username,
            phone: values.phone,
            status: true,
          },
        ])
        .select();

      if (error) throw error;

      const added = {
        key: newUser[0].id,
        id: newUser[0].id,
        serial: data.length + 1,
        name: newUser[0].name,
        username: newUser[0].username,
        phone: newUser[0].phone,
        address: "No coordinates",
        tags: ["member"],
        status: true,
      };

      const newData = [...data, added];
      setData(newData);
      setFilteredData(newData);
      message.success("User created successfully");
      setIsModalVisible(false);
      createForm.resetFields();
    } catch (error) {
      message.error("Failed to create user: " + error.message);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    createForm.resetFields();
  };

  const columns = [
    { title: "No.", dataIndex: "serial", key: "serial" },
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
            style={{ width: 150, marginLeft: 4, padding: "0 8px" }}
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
      editable: true,
      width: 200,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      editable: true,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      editable: true,
    },
        {
      title: "Address (Lat:Long)",
      dataIndex: "address",
      key: "address",
      editable: true,
    },
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
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a
              onClick={() => save(record.id, record.username)}
              style={{ marginRight: 8 }}
            >
              Save
            </a>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Space size="middle">
            <a disabled={editingKey !== ""} onClick={() => edit(record)}>
              Edit
            </a>
            <Switch
              checkedChildren="လိုက်မယ်"
              unCheckedChildren="မလိုက်ဘူး"
              checked={record.status}
              onChange={(checked) =>
                handleToggleActive(record.id, record.username, checked)
              }
              disabled={loading}
            />
            <Popconfirm
              title={
                <span>
                  Delete the <strong>{record.name}</strong>
                </span>
              }
              description="Are you sure to delete this task?"
              onConfirm={() => handleDelete(record.id, record.username)}
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
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data: users, error } = await supabase
        .from("users")
        .select(
          `id, name, username, longitude, latitude, status, created_at, phone`
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
          } else {
            coords = "No coordinates";
          }

          return {
            key: user.id,
            id: user.id,
            serial: index + 1,
            name: user.name,
            username: user.username,
            phone: user.phone,
            address: coords,
            tags: ["member"],
            status: user.status ?? true,
          };
        });

        setData(formatted);
        setFilteredData(formatted);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: dataIndex !== "address" && dataIndex !== "phone",
                message: `Please Input ${title}!`,
              },
            ]}
          >
            <Input />
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateUser}
        >
          Create User
        </Button>
      </div>

      <Form form={form} component={false}>
        <Table
          rowKey="id" // ✅ important
          components={{ body: { cell: EditableCell } }}
          bordered
          columns={mergedColumns}
          dataSource={filteredData}
          loading={loading}
          rowClassName="editable-row"
          pagination={false}
        />
      </Form>

      {/* Modal for creating new user */}
      <Modal
        title="Create User"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input username!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
