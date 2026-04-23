import { Link } from 'react-router-dom';
import { CalendarRange, Mail } from 'lucide-react';
import { vipPassKindLabel } from '../../lib/vip-pass';

export function VipPassOverview() {
  return (
    <div className="content-stack">
      <section className="panel vip-pass-intro">
        <div className="vip-pass-intro__header">
          <div>
            <h3 className="vip-pass-intro__title">Управление на VIP услуги</h3>
            <p className="vip-pass-intro__lede">
              Лесно създаване и управление на извънредни VIP часове за Вежди и Устни. Обявявате до 4 часа общо за месец,
              следите заявилите интерес и изпращате известия по имейл — директно от тук.
            </p>
          </div>
        </div>
        <p className="eyebrow vip-pass-intro__services-label">Двете услуги</p>
        <ul className="vip-pass-intro__services" aria-label="VIP услуги">
          <li className="vip-pass-intro__service">
            <span className="vip-kind-pill vip-kind-pill--brows">{vipPassKindLabel('brows')}</span>
            <p>Извънредни часове за вежди; отделен календар и известия само за клиенти, заявили интерес към този тип.</p>
          </li>
          <li className="vip-pass-intro__service">
            <span className="vip-kind-pill vip-kind-pill--lips">{vipPassKindLabel('lips')}</span>
            <p>Извънредни часове за устни; същото управление и известия като за вежди, но за отделната услуга.</p>
          </li>
        </ul>
        <ul className="vip-pass-intro__list">
          <li>Календар за следващия месец — обикновено обявявате часовете 1–2 дни преди началото на месеца</li>
          <li>Списък с клиенти, заявили интерес — с филтър по тип</li>
          <li>При добавяне на часове: опция да известите всички заявили или само избрани (чрез имейл клиента ви)</li>
        </ul>
        <div className="vip-pass-intro__actions">
          <Link className="button primary" to="/vip-pass/slots">
            <CalendarRange size={18} />
            VIP часове и календар
          </Link>
          <Link className="button secondary" to="/vip-pass/interests">
            <Mail size={18} />
            Заявки и клиенти
          </Link>
        </div>
      </section>
    </div>
  );
}
