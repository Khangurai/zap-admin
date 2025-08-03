import React, { useState, useEffect } from "react";
import { Upload, Image, message } from "antd";
import ImgCrop from "antd-img-crop";
import { supabase } from "../../../server/supabase/supabaseClient";
import avatarPlaceholder from "../../assets/profile-user.png";
import "./style.css";

const AvatarUpload = ({ user, profile, refreshUserProfile }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);

  // ✅ Initial load (if profile has avatar)
  useEffect(() => {
    if (profile?.avatar_url) {
      setFileList([
        {
          uid: "-1",
          name: "avatar.png",
          status: "done",
          url: profile.avatar_url,
        },
      ]);
    } else {
      setFileList([
        {
          uid: "-1",
          name: "avatar.png",
          status: "done",
          url: avatarPlaceholder,
        },
      ]);
    }
  }, [profile]);

  // ✅ Convert file to base64 (preview)
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // ✅ Handle preview
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  // ✅ Upload to Supabase
  const handleUpload = async ({ file, onSuccess, onError }) => {
    try {
      if (!user) {
        message.error("You must be logged in to upload an avatar");
        return;
      }

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

      // Delete old avatar if exists
      if (profile.avatar_url) {
        const url = new URL(profile.avatar_url);
        const pathSegments = url.pathname.split("/");
        const fileName = pathSegments[pathSegments.length - 1];
        await supabase.storage.from("avatars").remove([`admin-pics/${fileName}`]);
      }

      // Upload new avatar
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `admin-pics/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL & update profile
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update UI
      setFileList([
        { uid: "-1", name: "avatar.png", status: "done", url: publicUrl },
      ]);

      await refreshUserProfile();
      message.success("Avatar updated successfully!");
      onSuccess && onSuccess("ok");
    } catch (error) {
      console.error(error);
      message.error(`Upload failed: ${error.message}`);
      onError && onError(error);
    }
  };

  // ✅ Handle Remove Avatar
  const handleRemove = async () => {
    try {
      if (!profile.avatar_url) return;
      const url = new URL(profile.avatar_url);
      const pathSegments = url.pathname.split("/");
      const fileName = pathSegments[pathSegments.length - 1];

      await supabase.storage.from("avatars").remove([`admin-pics/${fileName}`]);

      await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      setFileList([
        {
          uid: "-1",
          name: "avatar.png",
          status: "done",
          url: avatarPlaceholder,
        },
      ]);

      await refreshUserProfile();
      message.success("Avatar removed successfully!");
    } catch (error) {
      console.error(error);
      message.error(`Remove failed: ${error.message}`);
    }
  };

  // ✅ Handle change (keep 1 file only)
  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));
  };

  return (
    <>
      <ImgCrop rotationSlider>
        <Upload
          customRequest={handleUpload}
          listType="picture-card"
          fileList={fileList}
          onChange={onChange}
          onPreview={handlePreview}
          onRemove={handleRemove}
          showUploadList={{
            showPreviewIcon: true,
            showRemoveIcon: true,
          }}
          maxCount={1}
          className="avatar-upload"
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

export default AvatarUpload;
