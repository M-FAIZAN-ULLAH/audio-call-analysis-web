import { Layout, Menu } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const { Header } = Layout;

const Navbar = () => {
  return (
    <Header className="bg-white shadow-md">
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">Your App</div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          className="flex-grow"
        >
          <Menu.Item key="1" icon={<MenuOutlined />}>
            Menu Item 1
          </Menu.Item>
          <Menu.Item key="2">Menu Item 2</Menu.Item>
          <Menu.Item key="3">Menu Item 3</Menu.Item>
        </Menu>
      </div>
    </Header>
  );
};

export default Navbar;
