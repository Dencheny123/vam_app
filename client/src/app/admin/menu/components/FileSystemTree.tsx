'use client';

import { useRouter } from 'next/navigation';
import { useFileSystem } from './FileSystemProvider';
import Space from 'antd/es/space';
import Button from 'antd/es/button';
import { FolderOpenOutlined, FolderOutlined, FileOutlined } from '@ant-design/icons';

interface UrlNode {
  path: string;
  name: string;
  isOpen?: boolean;
  children?: UrlNode[];
}

const UrlNodeRenderer = ({ node, level = 0 }: { node: UrlNode; level?: number }) => {
  const router = useRouter();
  const { toggleNode, burger, setBurger } = useFileSystem();
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div key={node.path} style={{ marginLeft: level * 16, marginBottom: 10 }}>
      <Space
        align="start"
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          maxWidth: '100%',
        }}
      >
        {hasChildren ? (
          <Button
            type="text"
            icon={
              node.isOpen ? (
                <FolderOpenOutlined style={{ color: '#69b1ff' }} />
              ) : (
                <FolderOutlined />
              )
            }
            onClick={() => toggleNode(node.path)}
            style={{
              color: '#69b1ff',
              padding: 0,
              display: 'flex',
              alignItems: 'flex-start',
              textAlign: 'left',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              maxWidth: 200,
            }}
          >
            <span style={{ color: '#fff', maxWidth: '100%' }}>{node.name}</span>
          </Button>
        ) : (
          <Button
            type="text"
            icon={<FileOutlined />}
            onClick={() => {
              setBurger(!burger);
              router.push(node.path);
            }}
            style={{
              color: '#fd9b9b',
              padding: 0,
              display: 'flex',
              alignItems: 'flex-start',
              textAlign: 'left',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              maxWidth: 200,
            }}
          >
            <span style={{ color: '#fff', maxWidth: '100%' }}>{node.name}</span>
          </Button>
        )}
        {hasChildren && (
          <Button
            type="link"
            size="small"
            onClick={() => {
              setBurger(!burger);
              router.push(node.path);
            }}
            style={{ marginLeft: 8 }}
          >
            ►
          </Button>
        )}
      </Space>

      {node.isOpen && hasChildren && (
        <div style={{ marginTop: 10 }}>
          {node.children?.map((child) => (
            <UrlNodeRenderer key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export function FileSystemTree() {
  const { urlStructure } = useFileSystem();

  return (
    <div>
      {urlStructure.map((node) => (
        <UrlNodeRenderer key={node.path} node={node} />
      ))}
    </div>
  );
}
