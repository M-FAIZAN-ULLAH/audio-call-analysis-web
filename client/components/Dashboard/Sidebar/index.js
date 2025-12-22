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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      width={256}
      style={{
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        backgroundColor: "#1f2937",
        zIndex: 1000,
      }}
      className="hidden lg:block"
    >
      <div className="flex flex-col h-full">
        <div
          className="logo px-4 py-6"
          style={{
            color: "white",
            textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="text-lg font-bold">Audio Insights</div>
          <div className="text-xs text-gray-400 mt-1">Analysis System</div>
        </div>
        <Menu
          style={{
            flex: 1,
            backgroundColor: "#1f2937",
            border: "none",
          }}
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleClick}
          className="px-2"
        >
          <Menu.Item
            key="1"
            icon={<HomeOutlined />}
            className="mt-4"
          >
            Dashboard
          </Menu.Item>
          <Menu.Item
            key="2"
            icon={<UserOutlined />}
          >
            Bulk Analysis
          </Menu.Item>
        </Menu>
        <div className="px-4 pb-4 border-t border-gray-700">
          <Button
            onClick={handleLogout}
            danger
            icon={<LogoutOutlined />}
            block
            className="mt-4"
          >
            Logout
          </Button>
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
