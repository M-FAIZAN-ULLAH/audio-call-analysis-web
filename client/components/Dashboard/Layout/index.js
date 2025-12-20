import React, { useState } from "react";
import { Layout, Menu, Button, Dropdown } from "antd";
import Sidebar from "../Sidebar";
import { useUser } from "../../utilis/userContext";
import ProfileUpdateModal from "./ProfileUpdateModal";
import { HomeOutlined, SettingOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;

const DashboardLayout = ({ children }) => {
  const { currentUser } = useUser();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profileUpdateVisible, setProfileUpdateVisible] = useState(false);

  const handleDropdownVisibleChange = (visible) => {
    setDropdownVisible(visible);
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="1"
        onClick={() => {
          setDropdownVisible(false);
          setProfileUpdateVisible(true);
        }}
      >
        Profile Update
      </Menu.Item>
      <Menu.Item key="2">Documentation</Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Sidebar />
      <Layout className="lg:ml-64">
        <Header className="bg-white shadow-md z-10 fixed w-full lg:w-auto lg:left-64">
          <div className="container mx-auto px-4 lg:px-6 flex items-center justify-between h-full">
            <Button
              type="link"
              icon={<HomeOutlined />}
              className="text-base"
            >
              {currentUser ? (
                <span className="hidden sm:inline">
                  Welcome! {currentUser.username}
                </span>
              ) : null}
            </Button>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Dropdown
                overlay={menu}
                trigger={["click"]}
                visible={dropdownVisible}
                onVisibleChange={handleDropdownVisibleChange}
              >
                <Button type="text" icon={<SettingOutlined />}>
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content
          className="mt-16 lg:mt-20"
          style={{ backgroundColor: "transparent", minHeight: "calc(100vh - 80px)" }}
        >
          {children}
        </Content>
      </Layout>
      <ProfileUpdateModal
        visible={profileUpdateVisible}
        onCancel={() => setProfileUpdateVisible(false)}
        userId={currentUser ? currentUser._id : null}
      />
    </Layout>
  );
};

export default DashboardLayout;
