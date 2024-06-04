// pages/dashboard.js
import DashboardLayout from "../Layout";
import emotionsData from "@/components/data";
import UploadAudio from "./UploadAudio";  

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div style={{marginTop: "100px", marginLeft: "30px", backgroundColor: "white", height: "auto", width: "1220px"}}>
        <div style={{marginTop: "20px"}}>
          <UploadAudio emotionsData={emotionsData} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
