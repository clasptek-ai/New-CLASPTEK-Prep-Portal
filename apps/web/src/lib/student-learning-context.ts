import { DatabasePool } from '@clasptek/persistence';
import { ConsoleLogger } from '@clasptek/observability';
import { loadEnvironment } from '@clasptek/configuration';
import {
  PostgresStudentLearningRepository,
  PostgresProgrammeEnrollmentRepository,
  PostgresStudentLearningPlanRepository,
  PostgresDashboardProjectionRepository,
  PostgresStudentLearningProfileRepository,
  PostgresReadinessRepository,
  PostgresInterventionRepository,
} from '@clasptek/persistence';
import {
  CreateJourneyHandler,
  ActivateJourneyHandler,
  PauseJourneyHandler,
  EnrolProgrammeHandler,
  WithdrawProgrammeHandler,
  CreateLearningGoalHandler,
  CompleteGoalHandler,
  StartStudySessionHandler,
  EndStudySessionHandler,
  UpdateCompetencyHandler,
  BookmarkResourceHandler,
  RemoveBookmarkHandler,
  ArchiveJourneyHandler,
  CreateLearningPlanHandler,
  CompleteMilestoneHandler,
  GetJourneyHandler,
  GetEnrollmentsHandler,
  GetLearningPlanHandler,
  GetDashboardHandler,
  SearchJourneysHandler,
  GetStudyStatisticsHandler,
  SetLearningPaceHandler,
  GetLearningProfileHandler,
  SetTargetExamDateHandler,
  GetExamTargetHandler,
  CalculateReadinessHandler,
  GetReadinessHandler,
  RunInterventionsHandler,
  GetInterventionsHandler,
  AcknowledgeInterventionHandler,
} from '@clasptek/application-student-learning';

export interface StudentLearningContext {
  // Command handlers
  createJourney: CreateJourneyHandler;
  activateJourney: ActivateJourneyHandler;
  pauseJourney: PauseJourneyHandler;
  enrolProgramme: EnrolProgrammeHandler;
  withdrawProgramme: WithdrawProgrammeHandler;
  createGoal: CreateLearningGoalHandler;
  completeGoal: CompleteGoalHandler;
  startSession: StartStudySessionHandler;
  endSession: EndStudySessionHandler;
  updateCompetency: UpdateCompetencyHandler;
  bookmarkResource: BookmarkResourceHandler;
  removeBookmark: RemoveBookmarkHandler;
  archiveJourney: ArchiveJourneyHandler;
  createPlan: CreateLearningPlanHandler;
  completeMilestone: CompleteMilestoneHandler;
  setLearningPace: SetLearningPaceHandler;
  setTargetExamDate: SetTargetExamDateHandler;
  calculateReadiness: CalculateReadinessHandler;
  runInterventions: RunInterventionsHandler;
  acknowledgeIntervention: AcknowledgeInterventionHandler;
  // Query handlers
  getJourney: GetJourneyHandler;
  getEnrollments: GetEnrollmentsHandler;
  getLearningPlan: GetLearningPlanHandler;
  getDashboard: GetDashboardHandler;
  searchJourneys: SearchJourneysHandler;
  getStatistics: GetStudyStatisticsHandler;
  getProfile: GetLearningProfileHandler;
  getExamTarget: GetExamTargetHandler;
  getReadiness: GetReadinessHandler;
  getInterventions: GetInterventionsHandler;
}

let cached: StudentLearningContext | null = null;

export function getStudentLearningContext(): StudentLearningContext {
  if (cached) return cached;

  const env = loadEnvironment();
  const logger = new ConsoleLogger('student-learning-context');
  const dbPool = new DatabasePool(env, logger);

  const journeyRepo = new PostgresStudentLearningRepository(dbPool);
  const enrollmentRepo = new PostgresProgrammeEnrollmentRepository(dbPool);
  const planRepo = new PostgresStudentLearningPlanRepository(dbPool);
  const dashboardRepo = new PostgresDashboardProjectionRepository(dbPool);
  const profileRepo = new PostgresStudentLearningProfileRepository(dbPool);
  const readinessRepo = new PostgresReadinessRepository(dbPool);
  const interventionRepo = new PostgresInterventionRepository(dbPool);

  cached = {
    // Commands
    createJourney: new CreateJourneyHandler(journeyRepo),
    activateJourney: new ActivateJourneyHandler(journeyRepo),
    pauseJourney: new PauseJourneyHandler(journeyRepo),
    enrolProgramme: new EnrolProgrammeHandler(journeyRepo, enrollmentRepo),
    withdrawProgramme: new WithdrawProgrammeHandler(enrollmentRepo),
    createGoal: new CreateLearningGoalHandler(journeyRepo),
    completeGoal: new CompleteGoalHandler(journeyRepo),
    startSession: new StartStudySessionHandler(journeyRepo),
    endSession: new EndStudySessionHandler(journeyRepo),
    updateCompetency: new UpdateCompetencyHandler(journeyRepo),
    bookmarkResource: new BookmarkResourceHandler(journeyRepo),
    removeBookmark: new RemoveBookmarkHandler(journeyRepo),
    archiveJourney: new ArchiveJourneyHandler(journeyRepo),
    createPlan: new CreateLearningPlanHandler(planRepo),
    completeMilestone: new CompleteMilestoneHandler(journeyRepo),
    setLearningPace: new SetLearningPaceHandler(profileRepo),
    setTargetExamDate: new SetTargetExamDateHandler(enrollmentRepo),
    calculateReadiness: new CalculateReadinessHandler(journeyRepo, readinessRepo, profileRepo),
    runInterventions: new RunInterventionsHandler(journeyRepo, interventionRepo, readinessRepo),
    acknowledgeIntervention: new AcknowledgeInterventionHandler(interventionRepo),
    // Queries
    getJourney: new GetJourneyHandler(journeyRepo),
    getEnrollments: new GetEnrollmentsHandler(enrollmentRepo),
    getLearningPlan: new GetLearningPlanHandler(planRepo),
    getDashboard: new GetDashboardHandler(dashboardRepo),
    searchJourneys: new SearchJourneysHandler(journeyRepo),
    getStatistics: new GetStudyStatisticsHandler(journeyRepo),
    getProfile: new GetLearningProfileHandler(profileRepo),
    getExamTarget: new GetExamTargetHandler(enrollmentRepo, profileRepo),
    getReadiness: new GetReadinessHandler(readinessRepo),
    getInterventions: new GetInterventionsHandler(interventionRepo),
  };

  return cached;
}
