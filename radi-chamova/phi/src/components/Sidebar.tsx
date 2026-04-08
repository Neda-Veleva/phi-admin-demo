import { BookOpen, ChevronRight, Gift, LayoutDashboard, LayoutGrid, Star } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  trainingsCount: number;
  hotLeadsCount: number;
  newLeadsCount: number;
  leadSignupsCount: number;
  vipPassInterestsCount: number;
}

export function Sidebar({
  trainingsCount,
  hotLeadsCount,
  newLeadsCount,
  leadSignupsCount,
  vipPassInterestsCount,
}: SidebarProps) {
  const location = useLocation();
  const trainingsGroupPath = location.pathname.startsWith('/trainings') || location.pathname.startsWith('/interests');
  const leadMagnetPath = location.pathname.startsWith('/lead-magnet');
  const vipPassPath = location.pathname.startsWith('/vip-pass');

  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <span className="brand-overline">Phi Back Office</span>
        <NavLink to="/" className="brand-title-link">
          <h1>PHI Admin</h1>
        </NavLink>
      </div>

      <nav className="sidebar-nav" aria-label="Главна навигация">
        <NavLink className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} to="/" end>
          <LayoutDashboard size={18} />
          <span>Табло</span>
        </NavLink>

        <NavLink className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} to="/services" end>
          <LayoutGrid size={18} />
          <span>Услуги</span>
        </NavLink>

        <div className={`sidebar-group ${vipPassPath ? 'sidebar-group--expanded' : 'sidebar-group--collapsed'}`}>
          <NavLink
            className={({ isActive }) =>
              `sidebar-link sidebar-group-trigger ${isActive || vipPassPath ? 'active' : ''}`
            }
            to="/vip-pass/slots"
          >
            <Star size={18} />
            <span>VIP PASS</span>
            <span className="sidebar-pill">{vipPassInterestsCount}</span>
            <ChevronRight size={16} className={`sidebar-chevron ${vipPassPath ? 'open' : ''}`} />
          </NavLink>

          <div className="sidebar-submenu">
            <NavLink className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`} to="/vip-pass/slots" end>
              Часове
            </NavLink>
            <NavLink className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`} to="/vip-pass/interests" end>
              Заявки
            </NavLink>
          </div>
        </div>

        <div className={`sidebar-group ${trainingsGroupPath ? 'sidebar-group--expanded' : 'sidebar-group--collapsed'}`}>
          <NavLink
            className={({ isActive }) =>
              `sidebar-link sidebar-group-trigger ${isActive || trainingsGroupPath ? 'active' : ''}`
            }
            to="/trainings"
          >
            <BookOpen size={18} />
            <span>Обучения</span>
            <span className="sidebar-pill">{trainingsCount}</span>
            <ChevronRight size={16} className={`sidebar-chevron ${trainingsGroupPath ? 'open' : ''}`} />
          </NavLink>

          <div className="sidebar-submenu">
            <NavLink className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`} to="/trainings" end>
              Списък с обучения
            </NavLink>
            <NavLink className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`} to="/interests" end>
              Заинтересовани хора
              <span className="sidebar-inline-badges">
                <span className="soft-pill hot">{hotLeadsCount} горещи</span>
                <span className="soft-pill new">{newLeadsCount} нови</span>
              </span>
            </NavLink>
          </div>
        </div>

        <div className={`sidebar-group ${leadMagnetPath ? 'sidebar-group--expanded' : 'sidebar-group--collapsed'}`}>
          <NavLink
            className={({ isActive }) =>
              `sidebar-link sidebar-group-trigger ${isActive || leadMagnetPath ? 'active' : ''}`
            }
            to="/lead-magnet/articles"
          >
            <Gift size={18} />
            <span>Безплатни ресурси</span>
            <span className="sidebar-pill">{leadSignupsCount}</span>
            <ChevronRight size={16} className={`sidebar-chevron ${leadMagnetPath ? 'open' : ''}`} />
          </NavLink>

          <div className="sidebar-submenu">
            <NavLink
              className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`}
              to="/lead-magnet/articles"
              end
            >
              Статии и материали
            </NavLink>
            <NavLink className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`} to="/lead-magnet/signups" end>
              Регистрации (мейли)
            </NavLink>
          </div>
        </div>
      </nav>
    </aside>
  );
}
