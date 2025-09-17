import React from 'react';
import style from '../../page.module.css';
import { MetaDataEditor } from '../../components/metaData/MetaDataEdit';

export default function MetadataPortfolioMain() {
  return (
    <div className={style.sidebar}>
      <MetaDataEditor index={3} />
    </div>
  );
}
