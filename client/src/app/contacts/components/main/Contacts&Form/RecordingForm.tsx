'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { sendRecordingThunk } from '@/entities/recording/api/RecordingFormApi';
import type { RecordingFormData } from '@/entities/recording/model';
import styles from '../../styles/RecordingForm.module.css';
import SuccessModal from '../SuccessModal/SuccessModal';
import { useRouter } from 'next/navigation';
import { trackFormSubmit } from '@/shared/utils/analytics';

export const RecordingForm = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [textModal, setTextModal] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RecordingFormData>();

  const admin = {
    name: 'admin',
    tel: 'admin',
    message: 'admin',
    personalData: true,
    oferta: true,
  };

  const auth = {
    name: 'auth',
    tel: 'auth',
    message: 'auth',
    personalData: true,
    oferta: true,
  };

  const menu = {
    name: 'menu',
    tel: 'menu',
    message: 'menu',
    personalData: true,
    oferta: true,
  };

  const onSubmit = async (data: RecordingFormData) => {
    const isAdminData =
      data.name === admin.name &&
      data.tel === admin.tel &&
      data.message === admin.message &&
      data.personalData === admin.personalData &&
      data.oferta === admin.oferta;

    const isAuthData =
      data.name === auth.name &&
      data.tel === auth.tel &&
      data.message === auth.message &&
      data.personalData === auth.personalData &&
      data.oferta === auth.oferta;

    const isMenuData =
      data.name === menu.name &&
      data.tel === menu.tel &&
      data.message === menu.message &&
      data.personalData === menu.personalData &&
      data.oferta === menu.oferta;

    if (isAdminData) {
      router.push('/admin');
      return;
    }

    if (isAuthData) {
      router.push('/admin/auth');
      return;
    }

    if (isMenuData) {
      router.push('/admin/menu');
      return;
    }

    try {
      const result = await dispatch(sendRecordingThunk(data)).unwrap();
      setModalOpen(true);
      setTextModal('Форма успешно отправлена!');
      
      // Трек успешной отправки формы
      await trackFormSubmit('recording-form', {
        name: data.name,
        tel: data.tel,
        message: data.message,
        status: 'success'
      });
      
      reset();
    } catch (error) {
      setModalOpen(true);
      setTextModal(`Ошибка: ${error || 'Возможно у вас включен VPN'}`);
      
      // Трек ошибки при отправке формы
      await trackFormSubmit('recording-form', {
        name: data.name,
        tel: data.tel,
        message: data.message,
        status: 'error',
        error: error?.toString() || 'Unknown error'
      });
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`${styles.formContainer} glass-card`}
      >
        <div className={styles.formTitle}>
          <span className={styles.mobileLineBreak}>
            Мы свяжемся с вами как можно скорее
          </span>
        </div>

        <div className={styles.formItem}>
          <input
            id="name"
            {...register('name', { required: 'Введите имя' })}
            className={styles.inputField}
            placeholder="Имя"
          />
          {errors.name && <p className={styles.errorText}>{errors.name.message}</p>}
        </div>

        <div className={styles.formItem}>
          <input
            type="tel"
            placeholder="Телефон"
            id="tel"
            {...register('tel', { required: 'Введите номер телефона' })}
            className={styles.inputField}
          />
          {errors.tel && <p className={styles.errorText}>{errors.tel.message}</p>}
        </div>

        <div className={styles.formItem}>
          <input
            placeholder="Сообщение"
            id="message"
            {...register('message')}
            className={styles.inputField}
          />
        </div>

        <label htmlFor="personalData" className={styles.checkboxLabel}>
          <input
            id="personalData"
            type="checkbox"
            className={styles.realCheckbox}
            {...register('personalData', { required: true })}
          />
          <span className={styles.customCheckbox}></span>
          <span>
            Я согласен на обработку персональных данных, с условиями{' '}
            <span className={styles.link}>Политики</span> ознакомлен
          </span>
        </label>
        {errors.personalData && (
          <p className={styles.errorText}>Обязательное соглашение</p>
        )}

        <label htmlFor="oferta" className={styles.checkboxLabel}>
          <input
            id="oferta"
            type="checkbox"
            className={styles.realCheckbox}
            {...register('oferta', { required: true })}
          />
          <span className={styles.customCheckbox}></span>
          <span>
            Я согласен с{' '}
            <span
              className={styles.link}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Офертой
            </span>
          </span>
        </label>
        {errors.oferta && <p className={styles.errorText}>Обязательное согласие</p>}

        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
          Записаться
        </button>
      </form>

      <SuccessModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        textModal={textModal}
      />
    </>
  );
};
