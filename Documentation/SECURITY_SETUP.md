# 🔒 Настройка безопасности CI/CD

## ⚠️ Важное предупреждение

**Текущая конфигурация содержит секреты в открытом виде в файле workflow!**  
Это временное решение, так как у вас нет доступа к GitHub Secrets. Как только получите доступ, немедленно переместите учетные данные в секреты.

## 🔐 Какие данные нужно защитить:

1. **Docker Hub Token**: `dckr_pat_your_actual_token_here`
2. **Railway Token**: `your_railway_token_here`
3. **База данных** и другие чувствительные переменные

## 🚀 Как переместить в GitHub Secrets:

### 1. Когда получите доступ к настройкам репозитория:

1. Перейдите: `https://github.com/KirillPanov163/STROYKA/settings/secrets/actions`
2. Нажмите "New repository secret"
3. Добавьте следующие секреты:

```
DOCKERHUB_USERNAME: your_dockerhub_username
DOCKERHUB_TOKEN: dckr_pat_your_actual_token_here
RAILWAY_TOKEN: your_railway_token_here
```

### 2. Обновите workflow файл:

Замените текущие переменные в `.github/workflows/docker-ci-cd.yml`:

```yaml
# ЗАМЕНИТЕ ЭТО:
env:
  DOCKERHUB_USERNAME: your_dockerhub_username
  DOCKERHUB_PASSWORD: dckr_pat_your_actual_token_here
  RAILWAY_TOKEN: your_railway_token_here

# НА ЭТО:
env:
  DOCKERHUB_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
  DOCKERHUB_PASSWORD: ${{ secrets.DOCKERHUB_TOKEN }}
  RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 🛡️ Дополнительные меры безопасности:

### 1. Rotate токенов (рекомендуется):
- Сгенерируйте новые токены после перемещения в секреты
- Удалите старые токены из Docker Hub и Railway

### 2. Database credentials:
- Никогда не храните в коде
- Используйте Railway Variables или аналоги
- Регулярно обновляйте пароли

### 3. Audit логи:
```bash
# Проверьте историю коммитов на наличие секретов
git log -p --grep="password\|token\|secret"
```

## 📋 Чеклист безопасности:

- [ ] Переместить Docker Hub token в GitHub Secrets
- [ ] Переместить Railway token в GitHub Secrets  
- [ ] Обновить workflow файл для использования секретов
- [ ] Удалить старые токены из открытого доступа
- [ ] Сгенерировать новые токены (рекомендуется)
- [ ] Проверить историю Git на утечки секретов

## 🆘 Если произошла утечка:

1. Немедленно сгенерируйте новые токены
2. Отзовите старые токены в Docker Hub и Railway
3. Обновите секреты в GitHub
4. Проверьте логи доступа

> 💡 **Важно**: Не коммитьте изменения с открытыми секретами после настройки безопасности!

## 🔗 Полезные ссылки:

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Docker Hub Access Tokens](https://docs.docker.com/docker-hub/access-tokens/)
- [Railway API Tokens](https://docs.railway.app/develop/api)

**Статус безопасности**: 🟡 ТРЕБУЕТСЯ НАСТРОЙКА (секреты в открытом виде)