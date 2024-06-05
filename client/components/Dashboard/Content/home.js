// pages/dashboard.js
import DashboardLayout from "../Layout";
import UploadAudio from "./UploadAudio";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div
        style={{
          marginTop: "100px",
          marginLeft: "30px",
          backgroundColor: "white",
          height: "auto",
          width: "1220px",
        }}
      >
        <div style={{ marginTop: "20px" }}>
          <UploadAudio />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
