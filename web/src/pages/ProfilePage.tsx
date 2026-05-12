import { profile } from '../data/mockData';

function ProfilePage() {
  return (
    <section className="content__row content__row--wide">
      <div className="card">
        <p className="eyebrow">Профиль</p>
        <h2>{profile.fullName}</h2>

        <div className="profile-list">
          <div>
            <span>Телефон</span>
            <strong>{profile.phone}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{profile.email}</strong>
          </div>
          <div>
            <span>Роль</span>
            <strong>{profile.role === 'admin' ? 'Администратор' : 'Пользователь'}</strong>
          </div>
          <div>
            <span>Кэшбэк</span>
            <strong>{profile.cashbackLevel}</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <p className="eyebrow">Настройки</p>
        <h2>Интерфейс</h2>

        <form className="form form--page">
          <label>
            Имя
            <input defaultValue={profile.fullName} />
          </label>

          <label>
            Тема
            <select defaultValue={profile.theme}>
              <option value="light">Светлая</option>
              <option value="dark">Тёмная</option>
            </select>
          </label>

          <button className="button-primary" type="button">
            Сохранить
          </button>
        </form>
      </div>
    </section>
  );
}

export default ProfilePage;
