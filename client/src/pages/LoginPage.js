import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Row, Col, Typography, Modal } from 'antd';
import { LockOutlined, PhoneOutlined } from '@ant-design/icons';
import axios from 'axios';
import '../styles/LoginPage.css';

const { Title, Text, Paragraph } = Typography;

function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        phone: values.phone,
        password: values.password,
      });

      const { token, user } = response.data;
      onLogin(token, user);
      message.success('登录成功！');

      if (user.force_password_change) {
        Modal.confirm({
          title: '首次登录提示',
          content: '首次登录需要修改密码，现在修改吗？',
          okText: '立即修改',
          cancelText: '稍后修改',
          onOk: () => {
            // 导航到修改密码页面
            window.location.href = '/change-password';
          },
        });
      }
    } catch (error) {
      message.error(error.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={22} sm={20} md={12} lg={8}>
          <Card className="login-card" bordered={false}>
            <div className="login-header">
              <Title level={2} style={{ margin: '20px 0 10px 0', textAlign: 'center' }}>
                👨‍👩‍👧‍👦 家族管理系统
              </Title>
              <Paragraph style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                维护您的家族人员关系
              </Paragraph>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              autoComplete="off"
            >
              <Form.Item
                label="手机号码"
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号码' },
                  {
                    pattern: /^1[3-9]\d{9}$/,
                    message: '请输入有效的手机号码',
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="13800138000"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  style={{ marginTop: '10px' }}
                >
                  登 录
                </Button>
              </Form.Item>
            </Form>

            <div className="demo-credentials">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <strong>演示账号：</strong><br />
                手机号码：13800138000<br />
                密码：13800138000
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default LoginPage;
