import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../server/supabase/supabaseClient";
import { Button, Card, Input, Form, message, Typography, QRCode } from "antd";
import { Zap } from "lucide-react";
import "../App.css"; // Ensure this file is imported for styles

const { Title } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        messageApi.error("Login failed: Your account is not verified. Please try again.");
      } else {
        messageApi.success("Login successful");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (e) {
      console.error("An unexpected error occurred during login:", e);
      messageApi.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [showQR, setShowQR] = useState(false);

  return (
    <>
      {contextHolder}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundImage: "url(./map-bg.png)",
          backgroundSize: "cover",
        }}
      >
        <Card style={{ width: 400 }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Zap size={32} className="zap-icon" style={{ marginBottom: 8 }} />
            <Title level={2}>ZAP Admin Login</Title>
          </div>
          <Form name="login" onFinish={handleLogin} layout="vertical">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please input a valid email!",
                },
              ]}
            >
              <Input placeholder="email@address.com" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Log In
              </Button>
            </Form.Item>
            <div style={{ textAlign: "center" }}>
              <Button
                type="link"
                style={{ padding: 0 }}
                onClick={() => setShowQR((prev) => !prev)}
              >
                Don't have an account?
              </Button>
              {showQR && (
                <>
                  <br />
                  <span style={{ marginRight: 12, alignSelf: "center" }}>
                    Scan this QR code to request <Zap className="zap-icon" size={17} />
                    ZAP-admin-panel!
                  </span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: 16,
                    }}
                  >
                    <QRCode
                      errorLevel="H"
                      value="https://t.me/khangurai"
                      icon="./zap-logo.svg"
                    />
                  </div>
                </>
              )}
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
}
