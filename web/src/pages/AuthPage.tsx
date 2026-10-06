import { useState } from 'react';
import type { FormEvent } from 'react';

import { UiIcon } from '../components/operations/Icon';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  loading?: boolean;
  error?: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
}

const FEATURES = [
  { icon: 'wallet', title: 'Счета в рублях, долларах и евро', text: 'Текущие и накопительные — с процентами на остаток' },
  { icon: 'transfer', title: 'Переводы и обмен валюты', text: 'Между своими счетами и другим клиентам по номеру счёта' },
  { icon: 'receipt', title: 'Аналитика трат', text: 'Поиск по операциям и диаграммы по категориям' },
];

function AuthPage({ loading = false, error, onLogin, onRegister }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isRegister = mode === 'register';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setLocalError('Введите почту и пароль.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setLocalError('Проверьте почту: в ней должны быть «@» и домен, например name@mail.ru.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Пароль должен быть не короче 8 символов.');
      return;
    }

    if (isRegister) {
      await onRegister(normalizedEmail, password);
    } else {
      await onLogin(normalizedEmail, password);
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setLocalError(null);
  }

  const message = localError || error;

  return (
    <main className="auth">
      <section className="auth__brand" aria-label="МИК Банк">
        <div className="auth__logo">
          <span>М</span>
          <span>МИК Банк</span>
        </div>
        <div>
          <h1 className="auth__headline">Счета, переводы и валюта в одном кабинете</h1>
          <p className="auth__lead">Откройте счёт за минуту, переводите деньги и следите за тратами по категориям.</p>
        </div>
        <ul className="auth__features">
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <span>
                <UiIcon name={feature.icon} size={20} />
              </span>
              <div>
                <strong>{feature.title}</strong>
                <small>{feature.text}</small>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="auth__panel" aria-label={isRegister ? 'Регистрация' : 'Вход'}>
        <div className="segmented segmented--block" role="tablist" aria-label="Вход или регистрация">
          <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? 'is-active' : undefined} onClick={() => switchMode('login')} disabled={loading}>
            Вход
          </button>
          <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? 'is-active' : undefined} onClick={() => switchMode('register')} disabled={loading}>
            Регистрация
          </button>
        </div>

        <div>
          <h2>{isRegister ? 'Создайте аккаунт' : 'Вход в личный кабинет'}</h2>
          <p>{isRegister ? 'Почта и пароль — больше ничего не нужно.' : 'Введите почту и пароль, указанные при регистрации.'}</p>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field__label">Почта</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              placeholder="name@mail.ru"
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
            />
          </label>

          <label className="field">
            <span className="field__label">Пароль</span>
            <span className="password-field">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                placeholder={isRegister ? 'Не короче 8 символов' : 'Ваш пароль'}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="icon-btn icon-btn--plain"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                onClick={() => setShowPassword((value) => !value)}
              >
                <UiIcon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
              </button>
            </span>
          </label>

          {message && (
            <div className="form-error" role="alert">
              {message}
            </div>
          )}

          <button className="btn btn--brand btn--block" style={{ height: 52 }} type="submit" disabled={loading}>
            {loading ? 'Подождите…' : isRegister ? 'Создать аккаунт' : 'Войти'}
          </button>
        </form>

        <p className="auth__note">Учебный проект: используйте любую почту, реальные данные не нужны.</p>
      </section>
    </main>
  );
}

export default AuthPage;
