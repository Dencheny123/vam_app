import React from 'react';
import { MetaDataEditor } from '../../../components/metaData/MetaDataEdit';
import style from '../../../page.module.css';

export default function MetadataPortfolioMain() {
  return (
    <div className={style.sidebar}>
      <MetaDataEditor index={2} />
    </div>
  );
}
