'use client';

import React, { useState } from 'react';
import { Input } from 'antd/es';

interface SearchFilterProps {
  placeholder?: string;
  onSearchChange: (searchTerm: string) => void;
}

const SearchFilter = ({
  placeholder = 'Поиск...',
  onSearchChange,
}: SearchFilterProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: 16,
        marginTop: 8,
        color: '#69b1ff',
      }}
    >
      <h3>Поиск</h3>
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        style={{
          maxWidth: 300,
          background: '#334155',
          border: '1px solid #64748b',
          borderRadius: 4,
        }}
        allowClear
      />
    </div>
  );
};

export default SearchFilter;
