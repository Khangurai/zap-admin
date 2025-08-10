import React, { useEffect, useState } from "react";
import { Space, Table, Tag, Switch } from "antd";
import { supabase } from "../../../server/supabase/supabaseClient";

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Team Code",
    dataIndex: "team_code",
    key: "team_code",
  },
  {
    title: "Address (Lat:Long)",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Tags",
    key: "tags",
    dataIndex: "tags",
    render: (_, { tags }) => (
      <>
        {tags?.map((tag) => {
          let color = tag.length > 5 ? "geekblue" : "green";
          if (tag === "loser") {
            color = "volcano";
          }
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
          checked={record.active}
          onChange={(checked) => {
            console.log(`Switch for ${record.name} is now:`, checked);
            // API call / update status logic here
          }}
        />
        <a>Delete</a>
      </Space>
    ),
  },
];

const UserList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      // Option 1: Try to get longitude, latitude if they exist
      const { data: users, error } = await supabase
        .from("users")
        .select(`
          id,
          name,
          team_code,
          location,
          longitude,
          latitude
        `);

      console.log(users);

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        const formatted = users.map((user) => {
          let coords = "";
          
          // Try to use generated columns first
          if (user.latitude && user.longitude) {
            coords = `${user.latitude}, ${user.longitude}`;
          } 
          // If generated columns don't exist, parse the PostGIS location string
          else if (user.location) {
            try {
              // PostGIS EWKB format - this is a simplified parsing approach
              // For a more robust solution, you'd want to use a proper PostGIS parser
              // or handle this on the server side with SQL functions
              console.log("Location string:", user.location);
              coords = "Coordinates available (needs parsing)";
            } catch (error) {
              console.error("Error parsing location:", error);
              coords = "";
            }
          }

          return {
            key: user.id,
            id: user.id,
            name: user.name,
            team_code: user.team_code,
            address: coords,
            tags: user.tags || ["member"],
            active: user.active ?? false,
          };
        });

        console.log("Formatted Data:", formatted);
        setData(formatted);
      }

      setLoading(false);
    };

    fetchUsers();
  }, []);

  return <Table columns={columns} dataSource={data} loading={loading} />;
};

export default UserList;