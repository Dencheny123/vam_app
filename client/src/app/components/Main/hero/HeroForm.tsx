'use client';

import React, { useState, useRef } from 'react';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { sendRecordingThunk } from '@/entities/recording/api/RecordingFormApi';
import styles from '../../styles/HeroSection.module.css';
import { trackFormSubmit } from '@/shared/utils/analytics';

const HeroForm = () => {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const lastPhoneLength = useRef(0);

  // Форматирование номера телефона
  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы и первую 7, если она есть
    const cleaned = value.replace(/\D/g, '').replace(/^7/, '');
    
    // Ограничиваем длину номера (10 цифр)
    const limited = cleaned.slice(0, 10);
    
    // Форматируем номер в формате +7 (XXX) XXX-XX-XX
    let formatted = '';
    
    if (limited.length > 0) {
      // Всегда добавляем +7 и открывающую скобку
      formatted = '+7 (';
      
      // Добавляем первые 3 цифры
      if (limited.length > 0) {
        formatted += limited.slice(0, 3);
        
        // После 3 цифр добавляем закрывающую скобку и пробел
        if (limited.length >= 3) {
          formatted += ') ';
          
          // Добавляем следующие 3 цифры
          if (limited.length > 3) {
            formatted += limited.slice(3, 6);
            
            // Добавляем дефис после следующих 2 цифр
            if (limited.length > 6) {
              formatted += `-${limited.slice(6, 8)}`;
              
              // Добавляем последний дефис и оставшиеся цифры
              if (limited.length > 8) {
                formatted += `-${limited.slice(8, 10)}`;
              }
            }
          }
        }
      }
    }
    
    return formatted;
  };

  // Обработчик изменения значения в поле ввода
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPosition = input.selectionStart || 0;
    const prevValue = input.value;
    
    // Получаем только цифры из введенного значения
    let cleaned = input.value.replace(/\D/g, '');
    
    // Удаляем первую 7, если она есть (кроме как первой цифрой)
    if (cleaned.length > 1 && cleaned[0] === '7') {
      cleaned = cleaned.substring(1);
    }
    
    // Ограничиваем длину номера (10 цифр)
    const limited = cleaned.slice(0, 10);
    
    // Определяем, была ли это вставка или удаление
    const isAdding = limited.length > phone.length;
    
    // Обновляем состояние (храним только цифры)
    setPhone(limited);
    
    // Форматируем номер для отображения
    const formattedValue = formatPhoneNumber(limited);
    
    // Вычисляем новую позицию курсора
    let newCursorPosition = cursorPosition;
    
    if (isAdding) {
      // При добавлении цифры
      if (limited.length <= 3) {
        // При вводе первых 3 цифр ставим курсор после скобки
        newCursorPosition = 4 + limited.length;
      } else if (limited.length <= 6) {
        // При вводе следующих 3 цифр ставим курсор после пробела
        newCursorPosition = 5 + limited.length;
      } else if (limited.length <= 8) {
        // При вводе следующих 2 цифр ставим курсор после первого дефиса
        newCursorPosition = 6 + limited.length;
      } else {
        // При вводе последних 2 цифр ставим курсор после второго дефиса
        newCursorPosition = 7 + limited.length;
      }
    } else {
      // При удалении
      if (cursorPosition <= 4) {
        // Если удаляем в первых 3 цифрах, оставляем курсор на месте
        newCursorPosition = Math.max(4, cursorPosition);
      } else if (cursorPosition <= 9) {
        // Если удаляем во второй группе цифр, оставляем курсор на месте
        newCursorPosition = Math.max(9, cursorPosition);
      } else if (cursorPosition <= 12) {
        // Если удаляем в третьей группе цифр, оставляем курсор на месте
        newCursorPosition = Math.max(12, cursorPosition);
      } else {
        // Если удаляем в последней группе цифр, оставляем курсор на месте
        newCursorPosition = cursorPosition;
      }
    }
    
    // Обновляем значение в DOM
    input.value = formattedValue;
    
    // Устанавливаем курсор на новую позицию
    requestAnimationFrame(() => {
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
    
    // Сохраняем длину номера для следующего вызова
    lastPhoneLength.current = limited.length;
  };

  const dispatch = useAppDispatch();

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем, что введен полный номер (10 цифр)
    if (phone.length !== 10) {
      setError('Пожалуйста, введите полный номер телефона');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const formData = {
        tel: `+7${phone}`,
        name: 'Заказ обратного звонка',
        message: 'Запрос на обратный звонок с главной страницы',
        personalData: 'on',
        oferta: 'on'
      };
      
      // Отправляем запрос на сервер
      const resultAction = await dispatch(sendRecordingThunk(formData));
      
      // Проверяем результат запроса
      if (sendRecordingThunk.fulfilled.match(resultAction)) {
        // Успешная отправка
        setIsSuccess(true);
        setPhone('');
        
        // Очищаем поле ввода
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        
        // Трек успешной отправки формы
        await trackFormSubmit('hero-callback-form', {
          tel: `+7${phone}`,
          name: 'Заказ обратного звонка',
          message: 'Запрос на обратный звонок с главной страницы',
          status: 'success'
        });
        
        // Скрываем сообщение об успехе через 5 секунд
        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      } else {
        // Обработка ошибки
        const errorMessage = resultAction.payload?.error || 'Произошла ошибка при отправке формы';
        setError(errorMessage);
        
        // Трек ошибки при отправке формы
        await trackFormSubmit('hero-callback-form', {
          tel: `+7${phone}`,
          name: 'Заказ обратного звонка',
          message: 'Запрос на обратный звонок с главной страницы',
          status: 'error',
          error: errorMessage
        });
      }
      
    } catch (err) {
      console.error('Ошибка при отправке формы:', err);
      const errorMsg = 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз.';
      setError(errorMsg);
      
      // Трек ошибки при отправке формы
      await trackFormSubmit('hero-callback-form', {
        tel: `+7${phone}`,
        name: 'Заказ обратного звонка',
        message: 'Запрос на обратный звонок с главной страницы',
        status: 'error',
        error: err?.toString() || 'Unknown error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.contactForm}>
      <div className={styles.formGroup}>
        <input 
          ref={inputRef}
          type="tel" 
          name="phone"
          onChange={handlePhoneChange}
          onKeyDown={(e) => {
            // Запрещаем ввод любых символов, кроме цифр и управляющих клавиш
            if (!/\d|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key) && !e.ctrlKey && !e.metaKey) {
              e.preventDefault();
            }
          }}
          placeholder="+7 (___) ___-__-__" 
          className={styles.phoneInput}
          required
        />
        <button 
          type="submit" 
          className={styles.ctaButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Отправка...' : 'Заказать звонок'}
        </button>
      </div>
      
      {/* Сообщения об ошибке и успехе */}
      {error && <div className={styles.errorMessage}>{error}</div>}
      {isSuccess && (
        <div className={styles.successMessage}>
          Спасибо! Мы перезвоним вам в ближайшее время.
        </div>
      )}
    </form>
  );
};

export default HeroForm;
