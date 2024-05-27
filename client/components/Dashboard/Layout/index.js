import { Layout, Menu, Button, Dropdown } from "antd";
import Sidebar from "../Sidebar";
import { useState } from "react";
import { HomeOutlined, SettingOutlined } from "@ant-design/icons";
const { Header, Content } = Layout;

const DashboardLayout = ({ children }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleDropdownVisibleChange = (visible) => {
    setDropdownVisible(visible);
  };

  const menu = (
    <Menu>
      <Menu.Item key="1">Profile Update</Menu.Item>
      <Menu.Item key="2">Documentation</Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout className="ml-64">
        <Header
          style={{ marginTop: "20px", marginLeft: "32px", width: "1235px" }}
          className="bg-white shadow-md z-10 fixed w-full"
        >
          <div className="container mx-auto px-4 flex  items-center">
            {/* <Button /> */}
            <Button
              style={{ marginRight: "20px" }}
              type="link"
              icon={<HomeOutlined />}
            >
              Home
            </Button>
            <h2 style={{ marginRight: "900px" }}>Dashboard</h2>
            {/* <div
              style={{ marginTop: "20px", paddingRight: "70px" }}
              className="text-lg font-semibold hover:text-blue-500 transition duration-300 ease-in-out"
            >
              <span>Dashboard</span>
            </div> */}
            <div className="flex items-center space-x-4">
              <Dropdown
                overlay={menu}
                trigger={["click"]}
                visible={dropdownVisible}
                onVisibleChange={handleDropdownVisibleChange}
              >
                <Button type="text" icon={<SettingOutlined />} />
              </Dropdown>
            </div>
          </div>
        </Header>
        {/*  className="mt-16 p-4" */}
        <Content style={{ backgroundColor: "white" }}>
          <div className="container mx-auto flex flex-col items-center justify-center h-full">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
