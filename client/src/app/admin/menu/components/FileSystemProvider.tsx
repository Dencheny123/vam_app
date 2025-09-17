'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface UrlNode {
  path: string;
  name: string;
  isOpen?: boolean;
  children?: UrlNode[];
}

interface FileSystemContextType {
  urlStructure: UrlNode[];
  toggleNode: (path: string) => void;
  burger: boolean;
  setBurger: (burger: boolean) => void;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const FileSystemProvider = ({
  children,
  burger,
  setBurger,
}: {
  children: ReactNode;
  burger: boolean;
  setBurger: (value: boolean) => void;
}) => {
  const [urlStructure, setUrlStructure] = useState<UrlNode[]>([
    {
      path: '/',
      name: 'Главная',
      isOpen: true,
      children: [
        {
          path: '/admin/menu/',
          name: 'Управление metadata',
          isOpen: false,
        },
        {
          path: '/admin/menu/faq',
          name: 'FAQ',
          isOpen: false,
        },
      ],
    },
    {
      path: '/services',
      name: 'Услуги',
      isOpen: false,
      children: [
        {
          path: '/admin/menu/services/metadata',
          name: 'Управление metadata',
          isOpen: false,
        },
        {
          path: '/admin/menu/services/all_services',
          name: 'Управление услугами',
          isOpen: false,
        },
      ],
    },
    {
      path: '/portfolio',
      name: 'Наши работы',
      isOpen: false,
      children: [
        {
          path: '/admin/menu/portfolio/metadata',
          name: 'Метаданные',
          isOpen: false,
          children: [
            {
              path: '/admin/menu/portfolio/metadata/main',
              name: 'metadata "/portfolio"',
              isOpen: false,
            },
            {
              path: '/admin/menu/portfolio/metadata/all_work',
              name: 'metadata "/all_works"',
              isOpen: false,
            },
            {
              path: '/admin/menu/portfolio/metadata/(alias)',
              name: 'metadata "/(alias)"',
              isOpen: false,
            },
          ],
        },
        {
          path: '/admin/menu/portfolio/works',
          name: 'Все работы',
          isOpen: false,
        },
      ],
    },
    {
      path: '/contacts',
      name: 'Контакты',
      isOpen: false,
      children: [
        {
          path: '/admin/menu/contact/metadata',
          name: 'Управление metadata',
          isOpen: false,
        },
        {
          path: '/admin/menu/contact/',
          name: 'Управление контактами',
          isOpen: false,
        },
      ],
    },
    {
      path: '/admin/menu/orders/',
      name: 'Управление',
      isOpen: false,
      children: [
        {
          path: '/admin/menu/images/',
          name: 'Управление img',
          isOpen: false,
        },
        {
          path: '/admin/menu/analytics',
          name: 'Аналитика',
          isOpen: false,
        },
        {
          path: '/admin/menu/orders/',
          name: 'Заказы',
          isOpen: false,
        },
        {
          path: '/admin/menu/notifications',
          name: 'Уведомления',
          isOpen: false,
        },
      ],
    },
  ]);

  const toggleNode = (path: string, nodes?: UrlNode[]): UrlNode[] => {
    const targetNodes = nodes || urlStructure;
    return targetNodes.map((node) => {
      if (node.path === path) {
        return { ...node, isOpen: !node.isOpen };
      }
      if (node.children) {
        return { ...node, children: toggleNode(path, node.children) };
      }
      return node;
    });
  };

  const handleToggle = (path: string) => {
    setUrlStructure((prev) => toggleNode(path, prev));
  };

  return (
    <FileSystemContext.Provider
      value={{ urlStructure, toggleNode: handleToggle, burger, setBurger }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};
