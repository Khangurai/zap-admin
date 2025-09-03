import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Form,
  Input,
  Popconfirm,
  Table,
  InputNumber,
  Image,
  Upload,
  message,
  Modal,
} from "antd";
import ImgCrop from "antd-img-crop";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { supabase } from "../../../server/supabase/supabaseClient";

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const ImageUploadCell = ({
  record,
  dataIndex,
  title,
  isAvatar,
  handleSave,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (record[dataIndex]) {
      setFileList([
        {
          uid: "-1",
          name: `${isAvatar ? "avatar" : "image"}.png`,
          status: "done",
          url: record[dataIndex],
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [record, dataIndex, isAvatar]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
      if (!file.type.startsWith("image/")) {
        message.error("Only image files are allowed!");
        return onError(new Error("Invalid file type"));
      }
      if (file.size / 1024 / 1024 > 2) {
        message.error("Image must be smaller than 2MB!");
        return onError(new Error("File too large"));
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${record.id || "new"}-${Date.now()}.${fileExt}`;
      const bucketName = isAvatar ? "avatars" : "cars";
      const folder = isAvatar ? "driver-pics" : "cars-pics";
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const updatedRecord = { ...record, [dataIndex]: publicUrl };
      handleSave(updatedRecord);

      message.success(`${isAvatar ? "Avatar" : "Image"} updated successfully!`);
      onSuccess("ok");
    } catch (error) {
      console.error(error);
      message.error(`Upload failed: ${error.message}`);
      onError(error);
    }
  };

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));
  };

  const handleRemove = async () => {
    try {
      if (!record[dataIndex]) return;
      const url = new URL(record[dataIndex]);
      const pathSegments = url.pathname.split("/");
      const filePath = pathSegments.slice(2).join("/");
      const bucketName = isAvatar ? "avatars" : "cars";

      const { error: removeError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (removeError) throw removeError;

      const updatedRecord = { ...record, [dataIndex]: null };
      handleSave(updatedRecord);

      message.success(`${isAvatar ? "Avatar" : "Image"} removed successfully!`);
    } catch (error) {
      console.error(error);
      message.error(`Remove failed: ${error.message}`);
    }
  };

  return (
    <>
      <ImgCrop
        rotationSlider
        aspect={isAvatar ? 1 : undefined}
        showGrid={isAvatar}
      >
        <Upload
          customRequest={handleUpload}
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={onChange}
          onRemove={handleRemove}
          showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
          maxCount={1}
        >
          {fileList.length < 1 && "+ Upload"}
        </Upload>
      </ImgCrop>

      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  inputType,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        {inputType === "number" ? (
          <InputNumber ref={inputRef} onPressEnter={save} onBlur={save} />
        ) : (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingInlineEnd: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const CarsMgmt = () => {
  const [cars, setCars] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const { data, error } = await supabase.from("fleet_mag").select("*");
    if (error) console.error(error);
    else setCars(data.map((c) => ({ key: c.id, ...c })));
  };

  const handleDelete = async (key) => {
    const car = cars.find((c) => c.key === key);
    const { error } = await supabase
      .from("fleet_mag")
      .delete()
      .eq("id", car.id);
    if (!error) {
      setCars(cars.filter((item) => item.key !== key));
    }
  };

  const handleSave = async (row) => {
    const newData = [...cars];
    const index = newData.findIndex((item) => row.key === item.key);
    newData.splice(index, 1, row);
    setCars(newData);

    const { error } = await supabase
      .from("fleet_mag")
      .update({
        car_number: row.car_number,
        driver: row.driver,
        capacity: row.capacity,
        route_id: row.route_id,
        image_url: row.image_url,
        avatar_url: row.avatar_url,
        d_username: row.d_username, // updated
      })
      .eq("id", row.id);

    if (error) console.error(error);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const { data, error } = await supabase
        .from("fleet_mag")
        .insert([values])
        .select();

      if (error) throw error;

      setCars([...cars, { key: data[0].id, ...data[0] }]);
      setIsModalOpen(false);
      form.resetFields();
      message.success("New car added!");
    } catch (err) {
      console.error(err);
      message.error(`Create failed: ${err.message}`);
    }
  };

  const columns = [
    { title: "Car Number", dataIndex: "car_number", editable: true },
    { title: "Driver", dataIndex: "driver", editable: true },
    { title: "Username", dataIndex: "d_username", editable: true }, // new column
    {
      title: "Capacity",
      dataIndex: "capacity",
      editable: true,
      inputType: "number",
    },
    { title: "route_id", dataIndex: "route_id", editable: true },
    // {
    //   title: "Image",
    //   dataIndex: "image_url",
    //   render: (text, record) => (
    //     <ImageUploadCell
    //       record={record}
    //       dataIndex="image_url"
    //       title="Car Image"
    //       handleSave={handleSave}
    //     />
    //   ),
    // },
    // {
    //   title: "Avatar",
    //   dataIndex: "avatar_url",
    //   render: (text, record) => (
    //     <ImageUploadCell
    //       record={record}
    //       dataIndex="avatar_url"
    //       title="Avatar"
    //       isAvatar={true}
    //       handleSave={handleSave}
    //     />
    //   ),
    // },
    {
      title: "Operation",
      dataIndex: "operation",
      render: (_, record) =>
        cars.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.key)}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ].map((col) => {
    if (!col.editable || col.render) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        inputType: col.inputType || "text",
      }),
    };
  });

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  return (
    <>
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
          onClick={() => setIsModalOpen(true)}
        >
          Create Car
        </Button>
      </div>

      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={cars}
        columns={columns}
      />

      <Modal
        title="Add New Car"
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCreate}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="car_number"
            label="Car Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="driver" label="Driver" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="d_username"
            label="d_username"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="route_id" label="route_id" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="image_url" label="Image URL">
            <Input />
          </Form.Item>
          <Form.Item name="avatar_url" label="Avatar URL">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CarsMgmt;
