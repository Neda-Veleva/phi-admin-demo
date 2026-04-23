import type { InterestedPerson } from '../types';

/** Контакти в CRM, свързани с курса: предпочитан или в списъка с обучения. */
export function interestsForCourse(people: InterestedPerson[], courseTrainingId: string): InterestedPerson[] {
  if (!courseTrainingId) return [];
  return people.filter(
    (p) => p.preferredTrainingId === courseTrainingId || p.trainingIds.includes(courseTrainingId)
  );
}
