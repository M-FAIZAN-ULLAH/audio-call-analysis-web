// import { useState } from "react";
// import { Layout, Menu } from "antd";
// import {
//   HomeOutlined,
//   UserOutlined,
//   SettingOutlined,
//   NotificationOutlined,
//   LogoutOutlined,
// } from "@ant-design/icons";

// const { Sider } = Layout;

// const Sidebar = () => {
//   const [selectedKey, setSelectedKey] = useState("1");

//   const handleClick = (e) => {
//     setSelectedKey(e.key);
//   };

//   return (
//     <Sider
//       breakpoint="lg"
//       collapsedWidth="0"
//       style={{
//         height: "100vh",
//         position: "fixed",
//         left: 0,
//         top: 0,
//         backgroundColor: "white",
//       }}
//     >
//       <Menu
//         style={{
//           marginTop: "15px",
//           marginLeft: "30px",
//           height: "625px",
//           justifyContent: "center",
//           width: "250px",
//           backgroundColor: "black",
//           color: "black",
//           gap: "40px",
//         }}
//         theme="light"
//         mode="inline"
//         selectedKeys={[selectedKey]}
//         onClick={handleClick}
//       >
//         <div
//           className="logo"
//           style={{
//             color: "white",
//             textAlign: "center",
//             marginTop: "50px",
//             marginRight: "30px",
//           }}
//         >
//           Audio Call Analysis System
//         </div>
//         <hr style={{ marginTop: "30px" }}></hr>
//         <Menu.Item
//           style={{ color: "white", marginTop: "70px" }}
//           key="1"
//           icon={<HomeOutlined />}
//         >
//           Home
//         </Menu.Item>
//         <div style={{ marginTop: "10px" }}></div>
//         <Menu.Item style={{ color: "white" }} key="2" icon={<UserOutlined />}>
//           Profile
//         </Menu.Item>
//         <div style={{ marginTop: "10px" }}></div>
//         <Menu.Item
//           style={{ color: "white" }}
//           key="3"
//           icon={<SettingOutlined />}
//         >
//           Settings
//         </Menu.Item>
//         <div style={{ marginTop: "10px" }}></div>

//         <Menu.Item
//           style={{ color: "white" }}
//           key="4"
//           icon={<NotificationOutlined />}
//         >
//           Notifications
//         </Menu.Item>
//         <div style={{ marginTop: "10px" }}></div>
//         <Menu.Item
//           //   key="5"

//           icon={<LogoutOutlined />}
//           style={{
//             marginBottom: "30px",
//             marginLeft: "35px",
//             position: "absolute",
//             bottom: 0,
//             width: "100%",
//             color: "white",
//           }}
//         >
//           Logout
//         </Menu.Item>
//       </Menu>
//     </Sider>
//   );
// };

// export default Sidebar;

// components/Sidebar.js
import { useState } from "react";
import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  NotificationOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const Sidebar = () => {
  const [selectedKey, setSelectedKey] = useState("1");

  const handleClick = (e) => {
    setSelectedKey(e.key);
  };

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      style={{
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        backgroundColor: "white",
      }}
    >
      <Menu
        style={{
          marginTop: "10px",
          marginLeft: "30px",
          height: "725px",
          justifyContent: "center",
          width: "250px",
          backgroundColor: "black",
          gap: "40px",
        }}
        theme="light"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={handleClick}
      >
        <div
          className="logo"
          style={{
            color: "white",
            textAlign: "center",
            marginTop: "50px",
            marginRight: "30px",
          }}
        >
          Audio Call Analysis System
        </div>
        <hr style={{ marginTop: "30px" }}></hr>
        <Menu.Item
          style={{
            color: selectedKey === "1" ? "black" : "white",
            marginTop: "70px",
          }}
          key="1"
          icon={<HomeOutlined />}
        >
          Home
        </Menu.Item>
        <div style={{ marginTop: "10px" }}></div>
        <Menu.Item
          style={{ color: selectedKey === "2" ? "black" : "white" }}
          key="2"
          icon={<UserOutlined />}
        >
          Profile
        </Menu.Item>
        <div style={{ marginTop: "10px" }}></div>
        <Menu.Item
          style={{ color: selectedKey === "3" ? "black" : "white" }}
          key="3"
          icon={<SettingOutlined />}
        >
          Settings
        </Menu.Item>
        <div style={{ marginTop: "10px" }}></div>
        <Menu.Item
          style={{ color: selectedKey === "4" ? "black" : "white" }}
          key="4"
          icon={<NotificationOutlined />}
        >
          Notifications
        </Menu.Item>
        <div style={{ marginTop: "10px" }}></div>
        <Menu.Item
          icon={<LogoutOutlined />}
          style={{
            marginBottom: "30px",
            marginLeft: "35px",
            position: "absolute",
            bottom: 0,
            width: "100%",
            color: "white",
          }}
        >
          Logout
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
