import style from './page.module.css';
import { MetaDataEditor } from './components/metaData/MetaDataEdit';

export default function AdminMenu() {
  return (
    <div className={style.sidebar}>
      <MetaDataEditor index={1} />
    </div>
  );
}
