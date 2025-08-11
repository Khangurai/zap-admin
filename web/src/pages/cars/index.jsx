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
} from "antd";
import ImgCrop from "antd-img-crop";
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

// Base64 conversion utility
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// Image upload cell component for handling image previews and uploads
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

  // Initialize fileList with existing image
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
      // Validate file type & size
      if (!file.type.startsWith("image/")) {
        message.error("Only image files are allowed!");
        onError && onError(new Error("Invalid file type"));
        return;
      }
      if (file.size / 1024 / 1024 > 2) {
        message.error("Image must be smaller than 2MB!");
        onError && onError(new Error("File too large"));
        return;
      }

      // CORRECTED: Use proper bucket and folder names based on isAvatar flag
      const fileExt = file.name.split(".").pop();
      const fileName = `${record.id}-${Date.now()}.${fileExt}`;
      
      // Determine bucket and folder based on isAvatar
      const bucketName = isAvatar ? "avatars" : "cars";
      const folder = isAvatar ? "driver-pics" : "cars-pics";
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update the record
      const updatedRecord = { ...record, [dataIndex]: publicUrl };
      handleSave(updatedRecord);

      message.success(`${isAvatar ? "Avatar" : "Image"} updated successfully!`);
      onSuccess && onSuccess("ok");
    } catch (error) {
      console.error(error);
      message.error(`Upload failed: ${error.message}`);
      onError && onError(error);
    }
  };

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));
  };

  const handleRemove = async () => {
    try {
      if (!record[dataIndex]) return;

      // Extract file path from URL
      const url = new URL(record[dataIndex]);
      const pathSegments = url.pathname.split("/");
      // Remove the first segment which is the bucket name
      const filePath = pathSegments.slice(2).join("/");

      // CORRECTED: Use proper bucket based on isAvatar
      const bucketName = isAvatar ? "avatars" : "cars";
      
      const { error: removeError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (removeError) throw removeError;

      // Update the record
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
      {/* Added ImgCrop wrapper with appropriate props */}
      <ImgCrop 
        rotationSlider 
        aspect={isAvatar ? 1 : undefined} // Set 1:1 aspect ratio for avatars only
        showGrid={isAvatar}
      >
        <Upload
          customRequest={handleUpload}
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={onChange}
          onRemove={handleRemove}
          showUploadList={{
            showPreviewIcon: true,
            showRemoveIcon: true,
          }}
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

const CarsTable = () => {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const { data, error } = await supabase.from("cars").select("*");
    if (error) console.error(error);
    else setCars(data.map((c) => ({ key: c.id, ...c })));
  };

  const handleDelete = async (key) => {
    const car = cars.find((c) => c.key === key);
    const { error } = await supabase.from("cars").delete().eq("id", car.id);
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
      .from("cars")
      .update({
        car_number: row.car_number,
        driver: row.driver,
        capacity: row.capacity,
        routes: row.routes,
        image_url: row.image_url,
        avatar_url: row.avatar_url,
      })
      .eq("id", row.id);

    if (error) console.error(error);
  };

  const columns = [
    { title: "Car Number", dataIndex: "car_number", editable: true },
    { title: "Driver", dataIndex: "driver", editable: true },
    {
      title: "Capacity",
      dataIndex: "capacity",
      editable: true,
      inputType: "number",
    },
    { title: "Routes", dataIndex: "routes", editable: true },
    {
      title: "Image",
      dataIndex: "image_url",
      render: (text, record) => (
        <ImageUploadCell
          record={record}
          dataIndex="image_url"
          title="Car Image"
          handleSave={handleSave}
        />
      ),
    },
    {
      title: "Avatar",
      dataIndex: "avatar_url",
      render: (text, record) => (
        <ImageUploadCell
          record={record}
          dataIndex="avatar_url"
          title="Avatar"
          isAvatar={true}
          handleSave={handleSave}
        />
      ),
    },
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
    <Table
      components={components}
      rowClassName={() => "editable-row"}
      bordered
      dataSource={cars}
      columns={columns}
    />
  );
};

export default CarsTable;