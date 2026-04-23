import { useEffect, useMemo, useState } from 'react';
import { matchPath, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppTopBar } from './components/AppTopBar';
import { DashboardView } from './components/DashboardView';
import { InterestFormPage } from './components/InterestFormPage';
import { InterestsListView } from './components/InterestsListView';
import { ServiceFormPage } from './components/ServiceFormPage';
import { ServicesView } from './components/ServicesView';
import { Sidebar } from './components/Sidebar';
import { TrainingEventFormPage } from './components/TrainingEventFormPage';
import { TrainingEventPreviewPage } from './components/TrainingEventPreviewPage';
import { TrainingEventsListView } from './components/TrainingEventsListView';
import { TrainingFormPage } from './components/TrainingFormPage';
import { TrainingPreviewPage } from './components/TrainingPreviewPage';
import { TrainingsListView } from './components/TrainingsListView';
import { AdminProvider } from './context/admin-context';
import { LeadArticleFormPage } from './components/lead-magnet/LeadArticleFormPage';
import { LeadArticlePreviewPage } from './components/lead-magnet/LeadArticlePreviewPage';
import { LeadArticlesListView } from './components/lead-magnet/LeadArticlesListView';
import { LeadSignupsView } from './components/lead-magnet/LeadSignupsView';
import { createId } from './lib/format';
import { loadStore, saveStore } from './lib/persistence';
import type {
  AdminStore,
  InterestedPerson,
  InterestNote,
  LeadArticle,
  LeadSignup,
  Service,
  Training,
  TrainingEvent,
  VipPassInterest,
  VipPassSlot,
} from './types';
import { VipPassInterestsView } from './components/vip-pass/VipPassInterestsView';
import { VipPassSlotsListView } from './components/vip-pass/VipPassSlotsListView';
import { VipPassSlotsNewPage } from './components/vip-pass/VipPassSlotsNewPage';

function useStandaloneFormRoute() {
  const { pathname } = useLocation();
  return (
    pathname === '/trainings/new' ||
    pathname === '/trainings/sessions/new' ||
    pathname === '/interests/new' ||
    pathname === '/services/new' ||
    pathname === '/lead-magnet/articles/new' ||
    Boolean(matchPath('/trainings/sessions/:eventId/edit', pathname)) ||
    Boolean(matchPath('/trainings/:trainingId/edit', pathname)) ||
    Boolean(matchPath('/interests/:interestId/edit', pathname)) ||
    Boolean(matchPath('/services/:serviceId/edit', pathname)) ||
    Boolean(matchPath('/lead-magnet/articles/:articleId/edit', pathname))
  );
}

export default function App() {
  const [store, setStore] = useState<AdminStore>(() => loadStore());

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const adminValue = useMemo(() => {
    function upsertTraining(training: Training) {
      setStore((current) => {
        const exists = current.trainings.some((item) => item.id === training.id);
        const trainings = exists
          ? current.trainings.map((item) => (item.id === training.id ? training : item))
          : [training, ...current.trainings];

        return {
          ...current,
          trainings,
          lastSyncedAt: new Date().toISOString(),
        };
      });
    }

    function upsertTrainingEvent(evt: TrainingEvent) {
      setStore((current) => {
        const list = current.trainingEvents ?? [];
        const exists = list.some((item) => item.id === evt.id);
        const trainingEvents = exists
          ? list.map((item) => (item.id === evt.id ? evt : item))
          : [evt, ...list];
        return { ...current, trainingEvents, lastSyncedAt: new Date().toISOString() };
      });
    }

    function removeTrainingEvent(id: string) {
      setStore((current) => ({
        ...current,
        trainingEvents: (current.trainingEvents ?? []).filter((e) => e.id !== id),
        lastSyncedAt: new Date().toISOString(),
      }));
    }

    /** Копие на събитие без записани хора; връща id на новото събитие. */
    function duplicateTrainingEvent(sourceId: string): string | null {
      let newId: string | null = null;
      const ts = new Date().toISOString();
      setStore((current) => {
        const list = current.trainingEvents ?? [];
        const src = list.find((e) => e.id === sourceId);
        if (!src) return current;
        const id = createId('training-event');
        newId = id;
        const copy: TrainingEvent = {
          id,
          trainingId: src.trainingId,
          date: src.date,
          city: src.city,
          capacity: src.capacity,
          published: false,
          attendees: [],
          createdAt: ts,
          updatedAt: ts,
        };
        return {
          ...current,
          trainingEvents: [copy, ...list],
          lastSyncedAt: ts,
        };
      });
      return newId;
    }

    function upsertInterest(person: InterestedPerson) {
      setStore((current) => {
        const exists = current.interests.some((item) => item.id === person.id);
        const interests = exists
          ? current.interests.map((item) => (item.id === person.id ? person : item))
          : [person, ...current.interests];

        return {
          ...current,
          interests,
          lastSyncedAt: new Date().toISOString(),
        };
      });
    }

    function addNote(interestId: string, note: InterestNote) {
      setStore((current) => ({
        ...current,
        interests: current.interests.map((person) =>
          person.id === interestId
            ? {
                ...person,
                notes: [note, ...person.notes],
                lastContactAt: note.createdAt,
              }
            : person
        ),
        lastSyncedAt: new Date().toISOString(),
      }));
    }

    function upsertLeadArticle(article: LeadArticle) {
      setStore((current) => {
        const exists = current.leadArticles.some((item) => item.id === article.id);
        const leadArticles = exists
          ? current.leadArticles.map((item) => (item.id === article.id ? article : item))
          : [article, ...current.leadArticles];

        return {
          ...current,
          leadArticles,
          lastSyncedAt: new Date().toISOString(),
        };
      });
    }

    function addLeadSignup(signup: LeadSignup) {
      setStore((current) => ({
        ...current,
        leadSignups: [signup, ...current.leadSignups],
        lastSyncedAt: new Date().toISOString(),
      }));
    }

    function updateLeadSignup(signup: LeadSignup) {
      setStore((current) => ({
        ...current,
        leadSignups: current.leadSignups.map((item) => (item.id === signup.id ? signup : item)),
        lastSyncedAt: new Date().toISOString(),
      }));
    }

    function markLeadSignupsMaterialSent(ids: string[], sent: boolean) {
      const idSet = new Set(ids);
      const ts = new Date().toISOString();
      setStore((current) => ({
        ...current,
        leadSignups: current.leadSignups.map((item) => {
          if (!idSet.has(item.id)) return item;
          return {
            ...item,
            materialSent: sent,
            materialSentAt: sent ? item.materialSentAt ?? ts : null,
          };
        }),
        lastSyncedAt: new Date().toISOString(),
      }));
    }

    function removeLeadSignup(signupId: string) {
      setStore((current) => ({
        ...current,
        leadSignups: current.leadSignups.filter((item) => item.id !== signupId),
        lastSyncedAt: new Date().toISOString(),
      }));
    }

    function upsertService(service: Service) {
      setStore((current) => {
        const exists = current.services.some((s) => s.id === service.id);
        const services = exists
          ? current.services.map((s) => (s.id === service.id ? service : s))
          : [service, ...current.services];
        return { ...current, services, lastSyncedAt: new Date().toISOString() };
      });
    }

    function removeService(serviceId: string) {
      setStore((current) => ({
        ...current,
        services: current.services.filter((s) => s.id !== serviceId),
        lastSyncedAt: new Date().toISOString(),
      }));
    }

    function upsertVipPassSlot(slot: VipPassSlot) {
      setStore((current) => {
        const exists = current.vipPassSlots.some((s) => s.id === slot.id);
        const vipPassSlots = exists
          ? current.vipPassSlots.map((s) => (s.id === slot.id ? slot : s))
          : [slot, ...current.vipPassSlots];
        return { ...current, vipPassSlots, lastSyncedAt: new Date().toISOString() };
      });
    }

    function removeVipPassSlot(slotId: string) {
      setStore((current) => ({
        ...current,
        vipPassSlots: current.vipPassSlots.filter((s) => s.id !== slotId),
        lastSyncedAt: new Date().toISOString(),
      }));
    }

    function upsertVipPassInterest(row: VipPassInterest) {
      setStore((current) => {
        const exists = current.vipPassInterests.some((r) => r.id === row.id);
        const vipPassInterests = exists
          ? current.vipPassInterests.map((r) => (r.id === row.id ? row : r))
          : [row, ...current.vipPassInterests];
        return { ...current, vipPassInterests, lastSyncedAt: new Date().toISOString() };
      });
    }

    function removeVipPassInterest(id: string) {
      setStore((current) => ({
        ...current,
        vipPassInterests: current.vipPassInterests.filter((r) => r.id !== id),
        lastSyncedAt: new Date().toISOString(),
      }));
    }

    return {
      store,
      upsertTraining,
      upsertTrainingEvent,
      removeTrainingEvent,
      duplicateTrainingEvent,
      upsertInterest,
      addNote,
      upsertLeadArticle,
      addLeadSignup,
      updateLeadSignup,
      markLeadSignupsMaterialSent,
      removeLeadSignup,
      upsertService,
      removeService,
      upsertVipPassSlot,
      removeVipPassSlot,
      upsertVipPassInterest,
      removeVipPassInterest,
    };
  }, [store]);

  const summary = useMemo(() => {
    return {
      newLeads: store.interests.filter((person) => person.status === 'new').length,
    };
  }, [store.interests]);

  const standaloneForm = useStandaloneFormRoute();

  return (
    <AdminProvider value={adminValue}>
      <div className="app-shell">
        <Sidebar
          trainingsCount={store.trainings.length}
          newLeadsCount={summary.newLeads}
          leadSignupsCount={store.leadSignups.length}
          vipPassInterestsCount={store.vipPassInterests.length}
        />

        <main className={`main-shell admin-main${standaloneForm ? ' main-shell--form' : ''}`}>
          {!standaloneForm && <AppTopBar />}
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/trainings" element={<TrainingsListView />} />
            <Route path="/trainings/sessions" element={<Navigate to="/trainings/sessions/upcoming" replace />} />
            <Route path="/trainings/sessions/upcoming" element={<TrainingEventsListView variant="upcoming" />} />
            <Route path="/trainings/sessions/past" element={<TrainingEventsListView variant="past" />} />
            <Route path="/trainings/sessions/new" element={<TrainingEventFormPage />} />
            <Route path="/trainings/sessions/:eventId/edit" element={<TrainingEventFormPage />} />
            <Route path="/trainings/sessions/:eventId" element={<TrainingEventPreviewPage />} />
            <Route path="/trainings/new" element={<TrainingFormPage />} />
            <Route path="/trainings/:trainingId/edit" element={<TrainingFormPage />} />
            <Route path="/trainings/:trainingId" element={<TrainingPreviewPage />} />
            <Route path="/interests" element={<InterestsListView />} />
            <Route path="/interests/new" element={<InterestFormPage />} />
            <Route path="/interests/:interestId/edit" element={<InterestFormPage />} />
            <Route path="/lead-magnet" element={<Navigate to="/lead-magnet/articles" replace />} />
            <Route path="/lead-magnet/articles" element={<LeadArticlesListView />} />
            <Route path="/lead-magnet/articles/new" element={<LeadArticleFormPage />} />
            <Route path="/lead-magnet/articles/:articleId/edit" element={<LeadArticleFormPage />} />
            <Route path="/lead-magnet/articles/:articleId" element={<LeadArticlePreviewPage />} />
            <Route path="/lead-magnet/signups" element={<LeadSignupsView />} />
            <Route path="/services" element={<ServicesView />} />
            <Route path="/services/new" element={<ServiceFormPage />} />
            <Route path="/services/:serviceId/edit" element={<ServiceFormPage />} />
            <Route path="/vip-pass" element={<Navigate to="/vip-pass/slots" replace />} />
            <Route path="/vip-pass/slots" element={<VipPassSlotsListView />} />
            <Route path="/vip-pass/slots/new" element={<VipPassSlotsNewPage />} />
            <Route path="/vip-pass/interests" element={<VipPassInterestsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AdminProvider>
  );
}
