import { matchPath, useLocation } from 'react-router-dom';

function resolveTopbar(pathname: string): { eyebrow?: string; title: string; subtitle?: string } {
  if (pathname === '/') {
    return {
      eyebrow: 'Phi Academy',
      title: 'Табло',
    };
  }
  if (pathname === '/trainings') {
    return { title: 'Обучения' };
  }
  if (pathname === '/trainings/sessions/upcoming') {
    return { eyebrow: 'Обучения', title: 'Предстоящи дати' };
  }
  if (pathname === '/trainings/sessions/past') {
    return { eyebrow: 'Обучения', title: 'Минали дати' };
  }
  if (pathname === '/trainings/sessions/new') {
    return { eyebrow: 'Дати на обучения', title: 'Ново събитие' };
  }
  if (matchPath('/trainings/sessions/:eventId/edit', pathname)) {
    return { eyebrow: 'Дати на обучения', title: 'Редакция на събитие' };
  }
  if (matchPath({ path: '/trainings/sessions/:eventId', end: true }, pathname)) {
    return { eyebrow: 'Дати на обучения', title: 'Преглед на събитие' };
  }
  if (pathname === '/trainings/new') {
    return { eyebrow: 'Обучения', title: 'Ново обучение' };
  }
  if (matchPath('/trainings/:trainingId/edit', pathname)) {
    return { eyebrow: 'Обучения', title: 'Редакция на обучение' };
  }
  if (matchPath({ path: '/trainings/:trainingId', end: true }, pathname)) {
    return { eyebrow: 'Обучения', title: 'Преглед на обучение' };
  }
  if (pathname === '/interests') {
    return { title: 'Заинтересовани хора' };
  }
  if (pathname === '/interests/new') {
    return { eyebrow: 'Обучения', title: 'Нов контакт' };
  }
  if (matchPath('/interests/:interestId/edit', pathname)) {
    return { eyebrow: 'Обучения', title: 'Карта на контакт' };
  }
  if (pathname === '/lead-magnet/articles') {
    return { title: 'Статии и материали' };
  }
  if (pathname === '/lead-magnet/articles/new') {
    return { eyebrow: 'Безплатни ресурси', title: 'Нова статия' };
  }
  if (matchPath('/lead-magnet/articles/:articleId/edit', pathname)) {
    return { eyebrow: 'Безплатни ресурси', title: 'Редакция на статия' };
  }
  if (matchPath({ path: '/lead-magnet/articles/:articleId', end: true }, pathname)) {
    return { eyebrow: 'Безплатни ресурси', title: 'Преглед на статия' };
  }
  if (pathname === '/lead-magnet/signups') {
    return { title: 'Регистрации и мейли' };
  }
  if (pathname === '/services') {
    return { eyebrow: 'Администрация', title: 'Услуги' };
  }
  if (pathname === '/vip-pass/slots') {
    return { title: 'VIP часове' };
  }
  if (pathname === '/vip-pass/interests') {
    return { title: 'VIP заявки' };
  }

  return { eyebrow: 'Phi Academy', title: 'Панел' };
}

export function AppTopBar() {
  const location = useLocation();
  const meta = resolveTopbar(location.pathname);

  return (
    <header className="topbar">
      <div>
        {meta.eyebrow && <span className="eyebrow">{meta.eyebrow}</span>}
        <h2 className={meta.eyebrow ? undefined : 'topbar-title-single'}>{meta.title}</h2>
        {meta.subtitle && <p className="topbar-subtitle">{meta.subtitle}</p>}
      </div>
    </header>
  );
}
