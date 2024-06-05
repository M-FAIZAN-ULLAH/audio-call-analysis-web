import "../styles/globals.css";
import { UserProvider } from "../components/utilis/userContext";
import { ConfigProvider } from "antd";

function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <ConfigProvider>
        <Component {...pageProps} />
      </ConfigProvider>
    </UserProvider>
  );
}

export default MyApp;
