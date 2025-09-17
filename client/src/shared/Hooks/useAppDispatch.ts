// Импортируем типы из нашего собственного хранилища и встроенных хуков Redux
import { AppDispatch } from '@/app/components/contexts/LayoutContext/store/store';
import { useDispatch } from 'react-redux';

// Создаем пользовательский хук для получения диспетчера с правильным типом
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
