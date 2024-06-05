import { Layout, Menu, Button, Dropdown } from "antd";
import Sidebar from "../Sidebar";
import { useState } from "react";
import { HomeOutlined, SettingOutlined } from "@ant-design/icons";
import { useUser } from "../../utilis/userContext";
const { Header, Content } = Layout;

const DashboardLayout = ({ children }) => {
  const { currentUser, isAuthenticated } = useUser();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleDropdownVisibleChange = (visible) => {
    setDropdownVisible(visible);
  };

  console.log("value: ", isAuthenticated);

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
          <div
            style={{ gap: "870px", marginTop: "10px", marginRight: "100px" }}
            className="container mx-auto px-4 flex  items-center"
          >
            {/* <Button /> */}
            <Button
              style={{ marginRight: "20px" }}
              type="link"
              icon={<HomeOutlined />}
            >
              {currentUser ? (
                <span>Welcome! {currentUser.username}</span>
              ) : null}
            </Button>
            <div className="flex items-center space-x-4">
              <Dropdown
                overlay={menu}
                trigger={["click"]}
                visible={dropdownVisible}
                onVisibleChange={handleDropdownVisibleChange}
              >
                <Button type="text" icon={<SettingOutlined />}>
                  Settings
                </Button>
              </Dropdown>
            </div>
          </div>
        </Header>
        {/*  className="mt-16 p-4" */}
        <Content style={{ backgroundColor: "white" }}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
