// components/ProfileUpdateModal.js

import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import axios from "axios";

const ProfileUpdateModal = ({ visible, onCancel, userId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const { newPassword } = values;

      await axios.put(
        `http://localhost:5000/api/users/${userId}/update-password`,
        {
          newPassword,
        }
      );

      setLoading(false);
      message.success("Password updated successfully!");
      onCancel();
    } catch (error) {
      setLoading(false);
      console.error("Failed to update password:", error);
      message.error("Failed to update password. Please try again later.");
    }
  };

  return (
    <Modal
      title="Profile Update"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="update"
          type="primary"
          loading={loading}
          onClick={handleUpdatePassword}
        >
          Update Password
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Email">
          <Input value={userId ? userId.email : null} disabled />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            {
              required: true,
              message: "Please enter the new password",
            },
          ]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProfileUpdateModal;
