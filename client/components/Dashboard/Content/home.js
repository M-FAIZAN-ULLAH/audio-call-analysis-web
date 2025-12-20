// pages/dashboard.js
import DashboardLayout from "../Layout";
import UploadAudio from "./UploadAudio";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="w-full">
        <UploadAudio />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
