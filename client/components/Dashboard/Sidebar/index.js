// import { useState } from "react";
// import { Layout, Menu } from "antd";
// import axiosClient from "../../../api/axiosClient";
// import {
//   HomeOutlined,
//   UserOutlined,
//   NotificationOutlined,
//   LogoutOutlined,
// } from "@ant-design/icons";
// import { useUser } from "../../utilis/userContext";
// import { useRouter } from "next/router";

// const { Sider } = Layout;

// const Sidebar = () => {
//   const router = useRouter();
//   const { setCurrentUser } = useUser();
//   const [selectedKey, setSelectedKey] = useState("1");

//   const handleClick = (e) => {
//     setSelectedKey(e.key);
//     switch (e.key) {
//       case "1":
//         router.push("/dashboard");
//         break;
//       case "2":
//         router.push("/dashboard/bulk-analysis");
//         break;
//       case "4":
//         router.push("/dashboard");
//         break;
//       default:
//         break;
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await axiosClient.post("/logout");
//       setCurrentUser(null);
//       router.push("/");
//     } catch (error) {
//       console.log(error);
//     }
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
//           marginTop: "10px",
//           marginLeft: "30px",
//           height: "725px",
//           justifyContent: "center",
//           width: "250px",
//           backgroundColor: "black",
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
//           style={{
//             color: selectedKey === "1" ? "black" : "white",
//             marginTop: "70px",
//           }}
//           key="1"
//           icon={<HomeOutlined />}
//         >
//           Analysis
//         </Menu.Item>
//         <div style={{ marginTop: "10px" }}></div>
//         <Menu.Item
//           style={{ color: selectedKey === "2" ? "black" : "white" }}
//           key="2"
//           icon={<UserOutlined />}
//         >
//           Bulk Analysis
//         </Menu.Item>
//         <div style={{ marginTop: "10px" }}></div>
//         <div style={{ marginTop: "10px" }}></div>
//         <Menu.Item
//           style={{ color: selectedKey === "4" ? "black" : "white" }}
//           key="4"
//           icon={<NotificationOutlined />}
//         >
//           History
//         </Menu.Item>
//         <div style={{ marginTop: "10px" }}></div>
//         <Menu.Item
//           icon={<LogoutOutlined />}
//           style={{
//             marginBottom: "30px",
//             marginLeft: "35px",
//             position: "absolute",
//             bottom: 0,
//             width: "80%",
//             color: "white",
//           }}
//         >
//           Logout
//           <button
//             onClick={(e) => {
//               e.stopPropagation(); // Prevents handleClick from being called
//               handleLogout();
//             }}
//             style={{ color: "black", fontWeight: "600" }}
//           >
//             Logout
//           </button>
//         </Menu.Item>
//       </Menu>
//     </Sider>
//   );
// };

// export default Sidebar;

import { useEffect, useState } from "react";
import { Layout, Menu, Button } from "antd";
import axiosClient from "../../../api/axiosClient";
import {
  HomeOutlined,
  UserOutlined,
  NotificationOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useUser } from "../../utilis/userContext";
import { useRouter } from "next/router";

const { Sider } = Layout;

const Sidebar = () => {
  const router = useRouter();
  const { setCurrentUser } = useUser();
  const [selectedKey, setSelectedKey] = useState("");

  useEffect(() => {
    // Set the initial selectedKey based on the current route
    const path = router.pathname.split("/")[2]; // Assuming the structure is /dashboard/[page]
    let key = "";
    switch (path) {
      case "":
      case "home":
        key = "1";
        break;
      case "bulk-analysis":
        key = "2";
        break;
      case "history":
        key = "4";
        break;
      default:
        break;
    }
    setSelectedKey(key);
  }, []);

  const handleClick = (e) => {
    setSelectedKey(e.key);
    switch (e.key) {
      case "1":
        router.push("/dashboard");
        break;
      case "2":
        router.push("/dashboard/bulk-analysis");
        break;
      case "4":
        router.push("/dashboard");
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post("/logout");
      setCurrentUser(null);
      router.push("/");
    } catch (error) {
      console.log(error);
    }
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
          Dashboard
        </Menu.Item>
        <div style={{ marginTop: "10px" }}></div>
        <Menu.Item
          style={{ color: selectedKey === "2" ? "black" : "white" }}
          key="2"
          icon={<UserOutlined />}
        >
          Bulk Analysis
        </Menu.Item>
        <div style={{ marginTop: "10px" }}></div>
        <div style={{ marginTop: "10px" }}></div>
        {/* <Menu.Item
          style={{ color: selectedKey === "4" ? "black" : "white" }}
          key="4"
          icon={<NotificationOutlined />}
        >
          History
        </Menu.Item> */}
        <div style={{ marginTop: "50px" }}></div>
        {/* <Menu.Item
          icon={<LogoutOutlined />}
          style={{
            marginBottom: "30px",
            marginLeft: "35px",
            position: "absolute",
            bottom: 0,
            width: "80%",
            color: "white",
          }}
        >
          Logout
        </Menu.Item> */}
        <Button
          onClick={(e) => {
            handleLogout();
          }}
          style={{
            color: "black",
            fontWeight: "600",
            width: "180px",
            marginTop: "370px",
            marginLeft: "30px",
          }}
        >
          Logout
        </Button>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
