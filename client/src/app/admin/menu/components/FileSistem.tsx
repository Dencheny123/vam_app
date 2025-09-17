'use client';

import { useFileSystem } from './FileSystemProvider';
import Layout from 'antd/es/layout';
import Typography from 'antd/es/typography';
import { FileSystemTree } from './FileSystemTree';
import style from './FileSystem.module.css';

const { Sider } = Layout;
const { Title } = Typography;

export function FileSystem() {
  const { urlStructure } = useFileSystem();

  return (
    <div className={style.menu}>
      <Sider
        width="100%"
        style={{
          background:
            'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)',
          padding: '16px',
          overflowY: 'auto',
          color: 'white',
          height: '100%',
          overflowX: 'hidden',
          borderRight: '1px solid #000000',
        }}
      >
        <Title level={4} style={{ color: '#fff' }}>
          Файловая система сайта
        </Title>
        <FileSystemTree />
      </Sider>
    </div>
  );
}