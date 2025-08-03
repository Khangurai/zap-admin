import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Typography, Divider } from "antd";
import { useAuth } from "../../auth/useAuth";
import { supabase } from "../../../server/supabase/supabaseClient";
import AvatarUpload from "./AvatarUpload";

const { Title, Text } = Typography;

const Profile = () => {
  const { user, profile, refreshUserProfile } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ Load user profile data
  useEffect(() => {
    if (user && profile) {
      form.setFieldsValue({
        email: user.email,
        full_name: profile.full_name || "",
      });
    }
  }, [user, profile, form]);

  // ✅ Profile update (Name + Password)
  const onFinish = async (values) => {
    if (!user) {
      message.error("You must be logged in to update your profile.");
      return;
    }

    setLoading(true);
    try {
      const { full_name } = values;
      let profileUpdated = false;
      let passwordUpdated = false;

      // Update full name
      if (full_name !== profile.full_name) {
        if (!full_name.trim()) {
          message.error("Full name cannot be empty");
          setLoading(false);
          return;
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: full_name.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (profileError) throw profileError;
        profileUpdated = true;
      }

      // Update password
      if (password) {
        if (password.length < 6) {
          message.error("Password must be at least 6 characters long");
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          message.error("Passwords do not match.");
          setLoading(false);
          return;
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password,
        });

        if (passwordError) throw passwordError;
        passwordUpdated = true;

        setPassword("");
        setConfirmPassword("");
        form.setFieldsValue({
          password: "",
          confirm_password: "",
        });
      }

      // Show success
      if (profileUpdated || passwordUpdated) {
        await refreshUserProfile();
        const updates = [];
        if (profileUpdated) updates.push("profile");
        if (passwordUpdated) updates.push("password");
        message.success(`${updates.join(" and ")} updated successfully!`);
      } else {
        message.info("No changes were made.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      message.error(`Operation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div
        style={{ minHeight: "100vh", background: "#f4f6f8", padding: "40px 0" }}
      >
        <Card style={{ maxWidth: 500, margin: "auto", textAlign: "center" }}>
          <div>Loading profile...</div>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: "100vh", background: "#f4f6f8", padding: "40px 0" }}
    >
      <Card
        style={{
          maxWidth: 400,
          margin: "auto",
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center", // ✅ center horizontally
            marginBottom: 24,
          }}
        >
          <AvatarUpload
            user={user}
            profile={profile}
            refreshUserProfile={refreshUserProfile}
          />
        </div>

        <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
          Profile Settings
        </Title>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Full Name"
            name="full_name"
            rules={[
              { required: true, message: "Please enter your full name" },
              { min: 2, message: "Full name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Your Organization Name(eg.UAB Bank)" size="large" />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input
              readOnly
              disabled
              size="large"
              style={{ backgroundColor: "#f5f5f5" }}
            />
          </Form.Item>

          <Divider />

          <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
            Change Password (Optional)
          </Text>

          <Form.Item
            label="New Password"
            name="password"
            style={{ marginTop: 16 }}
          >
            <Input.Password
              placeholder="Enter new password (min 6 characters)"
              size="large"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirm_password"
            dependencies={["password"]}
            rules={[
              {
                validator: (_, value) => {
                  if (password && !value) {
                    return Promise.reject(
                      new Error("Please confirm your password")
                    );
                  }
                  if (password && password !== value) {
                    return Promise.reject(new Error("Passwords do not match"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password
              placeholder="Confirm new password"
              size="large"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{ marginTop: 24 }}
          >
            Save Changes
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
