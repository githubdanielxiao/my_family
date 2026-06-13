import React, { useState, useEffect } from 'react';
import { Layout, Button, Avatar, message, Modal, Drawer, Form, Input, Select, DatePicker, Row, Col, Card, Empty, Tree, Space, Tag, Popover } from 'antd';
import { LogoutOutlined, EditOutlined, DeleteOutlined, PlusOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import '../styles/MainPage.css';

const { Header, Content, Sider } = Layout;

function MainPage({ user, onLogout }) {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [canManagePermissions, setCanManagePermissions] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Load family tree
  useEffect(() => {
    loadFamilyTree();
  }, []);

  const loadFamilyTree = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/members/tree');
      const tree = response.data;
      setMembers(tree);
      const treeNodes = buildTreeNodes(tree);
      setTreeData(treeNodes);
    } catch (error) {
      message.error('加载家族树失败');
    } finally {
      setLoading(false);
    }
  };

  const buildTreeNodes = (members) => {
    return members.map((member) => ({
      title: member.name,
      key: member.id,
      children: member.children ? buildTreeNodes(member.children) : [],
      data: member,
    }));
  };

  const handleSelectMember = async (selectedKeys) => {
    if (selectedKeys.length === 0) return;

    const memberId = selectedKeys[0];
    try {
      const response = await axiosInstance.get(`/members/${memberId}`);
      const memberData = response.data;
      setSelectedMember(memberData);

      // Check permissions
      try {
        const permResponse = await axiosInstance.get(`/permissions/member/${memberId}`);
        const userPermission = permResponse.data.find(p => p.user_id === user.id);
        setCanEdit(userPermission?.can_edit || false);
        setCanManagePermissions(userPermission?.can_manage_permissions || false);
      } catch (e) {
        setCanEdit(false);
        setCanManagePermissions(false);
      }
    } catch (error) {
      message.error('加载成员信息失败');
    }
  };

  const handleEditMember = () => {
    if (!selectedMember) return;
    editForm.setFieldsValue({
      ...selectedMember.member,
      birth_date: selectedMember.member.birth_date ? dayjs(selectedMember.member.birth_date) : null,
    });
    setEditDrawerVisible(true);
  };

  const handleSaveMember = async (values) => {
    try {
      const updateData = {
        ...values,
        birth_date: values.birth_date?.format('YYYY-MM-DD') || null,
      };
      await axiosInstance.put(`/members/${selectedMember.member.id}`, updateData);
      message.success('保存成功');
      setEditDrawerVisible(false);
      loadFamilyTree();
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleChangePassword = () => {
    Modal.confirm({
      title: '修改密码',
      content: '即将跳转到修改密码页面',
      onOk: () => {
        window.location.href = '/change-password';
      },
    });
  };

  const handleLogoutClick = () => {
    Modal.confirm({
      title: '确认退出',
      content: '您确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        onLogout();
      },
    });
  };

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Header */}
      <Header className="main-header">
        <div className="header-left">
          <span className="family-logo">👨‍👩‍👧‍👦</span>
          <span className="family-name">我的家族</span>
        </div>
        <div className="header-right">
          <div className="user-info">
            <Avatar>{user?.phone?.[0]}</Avatar>
            <span>{user?.phone}</span>
          </div>
          <Popover
            content={
              <div className="user-menu">
                <Button type="text" block onClick={handleChangePassword} style={{ textAlign: 'left' }}>
                  修改密码
                </Button>
                <Button type="text" danger block onClick={handleLogoutClick} style={{ textAlign: 'left' }}>
                  <LogoutOutlined /> 退出登录
                </Button>
              </div>
            }
            trigger="click"
          >
            <Button type="text" style={{ color: 'white' }}>
              ⚙️
            </Button>
          </Popover>
        </div>
      </Header>

      {/* Content */}
      <Layout style={{ flex: 1 }}>
        {/* Sidebar - Family Tree */}
        <Sider width={300} className="main-sider">
          <div className="tree-container">
            <h3 style={{ padding: '16px', marginBottom: '10px' }}>家族树</h3>
            {loading ? (
              <div style={{ padding: '16px' }}>加载中...</div>
            ) : treeData.length === 0 ? (
              <Empty description="暂无家族成员" />
            ) : (
              <Tree
                treeData={treeData}
                onSelect={handleSelectMember}
                defaultExpandAll
              />
            )}
          </div>
        </Sider>

        {/* Main Content */}
        <Content className="main-content">
          {selectedMember ? (
            <div className="member-detail">
              <div className="detail-header">
                <h2>{selectedMember.member.name}</h2>
                <Space>
                  {canEdit && (
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={handleEditMember}
                    >
                      编辑
                    </Button>
                  )}
                  {canManagePermissions && (
                    <Button
                      icon={<LockOutlined />}
                      onClick={() => message.info('权限管理功能开发中')}
                    >
                      权限管理
                    </Button>
                  )}
                </Space>
              </div>

              <Row gutter={[16, 16]}>
                {/* Personal Info */}
                <Col span={24}>
                  <Card title="个人信息" size="small">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <div className="info-item">
                          <span className="label">姓名:</span>
                          <span className="value">{selectedMember.member.name}</span>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div className="info-item">
                          <span className="label">性别:</span>
                          <span className="value">
                            {selectedMember.member.gender === 'male'
                              ? '男'
                              : selectedMember.member.gender === 'female'
                              ? '女'
                              : '其他'}
                          </span>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div className="info-item">
                          <span className="label">出生日期:</span>
                          <span className="value">{selectedMember.member.birth_date || '-'}</span>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div className="info-item">
                          <span className="label">手机号码:</span>
                          <span className="value">{selectedMember.member.phone || '-'}</span>
                        </div>
                      </Col>
                      <Col xs={24}>
                        <div className="info-item">
                          <span className="label">家庭住址:</span>
                          <span className="value">{selectedMember.member.address || '-'}</span>
                        </div>
                      </Col>
                      <Col xs={24}>
                        <div className="info-item">
                          <span className="label">新世界地址:</span>
                          <span className="value">{selectedMember.member.xinshijie_address || '-'}</span>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>

                {/* Parents Info */}
                {(selectedMember.father || selectedMember.mother) && (
                  <Col span={24}>
                    <Card title="双亲信息" size="small">
                      <Row gutter={[16, 16]}>
                        {selectedMember.father && (
                          <Col xs={24} sm={12}>
                            <div style={{ borderLeft: '3px solid #1890ff', paddingLeft: '12px' }}>
                              <p className="label">父亲</p>
                              <p className="value">{selectedMember.father.name}</p>
                            </div>
                          </Col>
                        )}
                        {selectedMember.mother && (
                          <Col xs={24} sm={12}>
                            <div style={{ borderLeft: '3px solid #ff85c0', paddingLeft: '12px' }}>
                              <p className="label">母亲</p>
                              <p className="value">{selectedMember.mother.name}</p>
                            </div>
                          </Col>
                        )}
                      </Row>
                    </Card>
                  </Col>
                )}

                {/* Children Info */}
                {selectedMember.children && selectedMember.children.length > 0 && (
                  <Col span={24}>
                    <Card title="子女信息" size="small">
                      <Row gutter={[16, 16]}>
                        {selectedMember.children.map((child) => (
                          <Col xs={24} sm={12} key={child.id}>
                            <div style={{ borderLeft: '3px solid #52c41a', paddingLeft: '12px' }}>
                              <p className="label">{child.gender === 'male' ? '儿子' : '女儿'}</p>
                              <p className="value">{child.name}</p>
                              {child.birth_date && <p style={{ fontSize: '12px', color: '#999' }}>{child.birth_date}</p>}
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  </Col>
                )}
              </Row>
            </div>
          ) : (
            <Empty description="请选择家族成员查看详细信息" />
          )}
        </Content>
      </Layout>

      {/* Edit Drawer */}
      <Drawer
        title="编辑成员信息"
        placement="right"
        onClose={() => setEditDrawerVisible(false)}
        open={editDrawerVisible}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSaveMember}
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="性别" name="gender">
            <Select
              options={[
                { label: '男', value: 'male' },
                { label: '女', value: 'female' },
                { label: '其他', value: 'other' },
              ]}
            />
          </Form.Item>
          <Form.Item label="出生日期" name="birth_date">
            <DatePicker />
          </Form.Item>
          <Form.Item label="手机号码" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="家庭住址" name="address">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="新世界地址" name="xinshijie_address">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </Layout>
  );
}

export default MainPage;
