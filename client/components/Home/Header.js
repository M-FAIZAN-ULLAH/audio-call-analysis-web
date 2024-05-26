import { useState } from 'react';
import { Modal, Button } from 'antd';
import styles from "../../styles/Header.module.css"

const Header = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
      <h1  className={styles.mycolor}>My Header</h1>
      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <Modal
        title="Ant Design Modal"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </header>
  );
};

export default Header;
