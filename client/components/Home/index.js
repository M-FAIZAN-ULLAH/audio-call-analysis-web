// import React from "react";
// import { Button } from "antd";

// function Home() {
//   return (
//     <>
//       <Button>Ant button</Button>
//     </>
//   );
// }

// export default Home;

import React from "react";
import { Button } from "antd";

const Home = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Button type="primary">Ant Design Button with Tailwind CSS</Button>
    </div>
  );
};

export default Home;
