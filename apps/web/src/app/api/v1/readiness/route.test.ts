/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Pre-populate environment variables
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mock_db';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
process.env.CONFIG_VERSION = '1.0.0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

import { NextRequest } from 'next/server';
import { GET as searchReadiness, POST as generateReadiness } from './route';
import { GET as getLatestReadiness } from './latest/route';
import { GET as getReadinessHistory } from './history/route';
import { GET as getActiveExp, POST as createExp } from './experiments/route';
import { POST as startExp } from './experiments/[id]/start/route';
import { POST as completeExp } from './experiments/[id]/complete/route';
import { POST as publishPred } from './predictions/[id]/publish/route';
import { POST as activateInter } from './predictions/[id]/interventions/[intId]/activate/route';
import { POST as completeInter } from './predictions/[id]/interventions/[intId]/complete/route';
import { POST as discardInter } from './predictions/[id]/interventions/[intId]/discard/route';
import { GET as getFeatures, POST as registerFeature } from './features/route';
import { GET as getInterventionsCatalogue } from './interventions/catalogue/route';
import { POST as recordOutcome } from './predictions/[id]/outcome/route';
import { GET as getLifecycleMetrics, POST as calculateLifecycleMetrics } from './metrics/route';

const dbStore = new Map<string, any>();
let querySqls: string[] = [];

vi.mock('pg', () => {
  const queryMock = vi.fn().mockImplementation(async (sql: string, params?: any[]) => {
    querySqls.push(sql);

    if (sql.includes('avg_latency')) {
      return { rows: [{ avg_latency: '150.50' }] };
    }
    if (sql.includes('total') && sql.includes('accepted')) {
      return { rows: [{ total: '10', accepted: '8' }] };
    }
    if (sql.includes('accepted') && sql.includes('completed')) {
      return { rows: [{ accepted: '8', completed: '6' }] };
    }
    if (sql.includes('avg_improvement')) {
      return { rows: [{ avg_improvement: '0.45' }] };
    }
    if (sql.includes('mae')) {
      return { rows: [{ mae: '0.35' }] };
    }

    if (sql.includes('INSERT INTO readiness_snapshots')) {
      if (params) dbStore.set(params[0], { id: params[0], student_id: params[1], learner_state: params[2], forecast_window: params[7] });
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO readiness_predictions')) {
      if (params) {
        dbStore.set(params[0], {
          id: params[0],
          student_id: params[1],
          profile_id: params[2],
          model_version_id: params[3],
          status: params[4],
          overall_readiness_score: params[5],
          confidence_value: params[6],
          lock_version: params[9],
          created_at: params[10],
          published_at: params[11]
        });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO prediction_feature_sets')) {
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO prediction_explanations')) {
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO prediction_experiments')) {
      if (params) {
        dbStore.set(params[0], {
          id: params[0],
          experiment_code: params[1],
          display_name: params[2],
          control_model_version_id: params[3],
          challenger_model_version_id: params[4],
          traffic_split_percentage: params[5],
          status: params[6],
          start_date: params[7],
          end_date: params[8]
        });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('UPDATE prediction_experiments')) {
      return { rowCount: 1 };
    }
    if (sql.includes('UPDATE readiness_predictions')) {
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO prediction_feature_catalogue')) {
      if (params) {
        dbStore.set('feat-' + params[1], {
          id: params[0],
          feature_code: params[1],
          display_name: params[2],
          source_domain: params[3],
          normalization_method: params[4],
          default_weight: params[5],
          version: params[6],
          description: params[7]
        });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO prediction_outcomes')) {
      if (params) {
        dbStore.set('out-' + params[0], {
          id: params[0],
          prediction_id: params[1],
          student_id: params[2],
          predicted_score: params[3],
          actual_score: params[4],
          variance: params[5],
          calibration_delta: params[6],
          recorded_at: params[7]
        });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO prediction_intervention_catalogue')) {
      if (params) {
        dbStore.set('int-cat-' + params[0], {
          id: params[0],
          intervention_type: params[1],
          title: params[2],
          description: params[3],
          priority: params[4],
          target_resource_id: params[5],
          target_competency_code: params[6]
        });
      }
      return { rowCount: 1 };
    }
    if (sql.includes('INSERT INTO prediction_lifecycle_metrics')) {
      if (params) {
        dbStore.set('metrics-' + params[1], {
          id: params[0],
          model_version_id: params[1],
          measured_at: params[2],
          generation_latency_ms: params[3],
          prediction_acceptance_rate: params[4],
          intervention_completion_rate: params[5],
          intervention_effectiveness: params[6],
          model_drift: params[7],
          experiment_success_rate: params[8]
        });
      }
      return { rowCount: 1 };
    }

    // Hydration queries Mock
    if (sql.includes('FROM readiness_predictions')) {
      // Find matching mock
      const val = Array.from(dbStore.values()).find(v => v.id === 'pred-1' || v.id === params?.[0]);
      const row = val ?? {
        id: 'pred-1',
        student_id: 'stud-1',
        profile_id: 'prof-1',
        model_version_id: 'mv-1',
        status: 'PUBLISHED',
        overall_readiness_score: '7.5',
        overall_readiness_score_scale: 'band',
        confidence_value: '0.92',
        confidence_interval_low: '7.0',
        confidence_interval_high: '8.0',
        lock_version: 1,
        created_at: new Date(),
        updated_at: new Date(),
        published_at: new Date()
      };
      return { rows: [row] };
    }

    if (sql.includes('FROM prediction_feature_sets')) {
      return { rows: [{ id: 'fs-1', prediction_id: 'pred-1', features: { ACCURACY: 0.8 } }] };
    }

    if (sql.includes('FROM prediction_explanations')) {
      return {
        rows: [{
          id: 'expl-1',
          prediction_id: 'pred-1',
          contributing_factors: JSON.stringify([{ factor: 'Accuracy', weight: 1.0 }]),
          feature_importance: { ACCURACY: 1.0 },
          confidence_explanation: 'High accuracy rate',
          evidence_references: JSON.stringify(['snap-1'])
        }]
      };
    }

    if (sql.includes('FROM prediction_evidence')) {
      return { rows: [{ id: 'ev-1', prediction_id: 'pred-1', evidence_type: 'PRACTICE', evidence_source_id: 'src-1', weight: '1.0', description: 'desc' }] };
    }

    if (sql.includes('FROM prediction_trends')) {
      return { rows: [{ id: 'tr-1', prediction_id: 'pred-1', trend_type: 'ACCURACY', slope: '0.05', explanation: 'exp' }] };
    }

    if (sql.includes('FROM prediction_interventions')) {
      return { rows: [{ id: 'int-1', prediction_id: 'pred-1', student_id: 'stud-1', risk_level: 'CRITICAL', risk_score: '90.0', trigger_reason: 'reason', status: 'ACTIVE' }] };
    }

    if (sql.includes('FROM prediction_recommendations')) {
      return { rows: [{ id: 'rec-1', intervention_id: 'int-1', recommendation_type: 'DRILL', priority: 1, title: 'Title', description: 'desc', target_resource_id: 'res-1', target_competency_code: 'comp-1' }] };
    }

    if (sql.includes('FROM prediction_feature_catalogue')) {
      if (sql.includes('WHERE feature_code = $1')) {
        const val = dbStore.get('feat-' + params?.[0]);
        return { rows: val ? [val] : [] };
      }
      const vals = Array.from(dbStore.values()).filter(v => v.feature_code);
      return { rows: vals };
    }

    if (sql.includes('FROM prediction_outcomes')) {
      if (sql.includes('WHERE id = $1')) {
        const val = dbStore.get('out-' + params?.[0]);
        return { rows: val ? [val] : [] };
      }
      if (sql.includes('WHERE prediction_id = $1')) {
        const val = Array.from(dbStore.values()).find(v => v.prediction_id === params?.[0] && v.predicted_score !== undefined);
        return { rows: val ? [val] : [] };
      }
      const vals = Array.from(dbStore.values()).filter(v => v.predicted_score !== undefined);
      return { rows: vals };
    }

    if (sql.includes('FROM prediction_intervention_catalogue')) {
      if (sql.includes('WHERE intervention_type = $1')) {
        const val = dbStore.get('int-cat-' + params?.[0]) || Array.from(dbStore.values()).find(v => v.intervention_type === params?.[0]);
        return { rows: val ? [val] : [] };
      }
      const vals = Array.from(dbStore.values()).filter(v => v.intervention_type !== undefined);
      if (vals.length === 0) {
        return { rows: [{ id: 'int-cat-1', intervention_type: 'GRAMMAR_HELP', title: 'Grammar support', description: 'desc', priority: 1, target_resource_id: null, target_competency_code: 'comp-1' }] };
      }
      return { rows: vals };
    }

    if (sql.includes('FROM prediction_learning_velocity_history')) {
      const val = Array.from(dbStore.values()).find(v => v.active_hours !== undefined);
      return { rows: val ? [val] : [{ id: 'vel-1', student_id: 'stud-1', active_hours: '4.50', questions_answered: 20, acceleration_rate: '0.20', stagnation_indicator: false, recorded_at: new Date() }] };
    }

    if (sql.includes('FROM prediction_lifecycle_metrics')) {
      const val = dbStore.get('metrics-' + params?.[0]) || Array.from(dbStore.values()).find(v => v.model_version_id === params?.[0]);
      return { rows: val ? [val] : [] };
    }

    if (sql.includes('FROM prediction_experiments')) {
      const val = Array.from(dbStore.values()).find(v => v.experiment_code === params?.[0] || v.id === params?.[0]);
      if (val) {
        return { rows: [val] };
      }
      if (sql.includes("status = 'RUNNING'")) {
        return {
          rows: [{
            id: 'exp-1',
            experiment_code: 'EXP-ACTIVE',
            display_name: 'Active Experiment',
            control_model_version_id: 'control-1',
            challenger_model_version_id: 'challenger-1',
            traffic_split_percentage: 50,
            status: 'RUNNING',
            start_date: new Date(),
            end_date: null,
            created_at: new Date()
          }]
        };
      }
      return { rows: [] };
    }

    return { rows: [], rowCount: 0 };
  });

  return {
    Pool: vi.fn().mockImplementation(() => {
      return {
        connect: vi.fn().mockResolvedValue({
          release: vi.fn(),
          query: queryMock
        }),
        end: vi.fn().mockResolvedValue(undefined),
        query: queryMock
      };
    })
  };
});

describe('Next.js Prediction Engine REST API Endpoints Integration Tests', () => {
  beforeEach(() => {
    dbStore.clear();
    querySqls = [];
  });

  test('POST and GET api/v1/readiness prediction search & generate', async () => {
    // 1. Generate
    const postReq = new NextRequest('http://localhost/api/v1/readiness', {
      method: 'POST',
      headers: { 'x-student-id': 'stud-1' },
      body: JSON.stringify({
        profileId: 'prof-1',
        profileCode: 'IELTS_ACADEMIC',
        learnerState: { writing: 6.5, speaking: 7.0 },
        forecastWindow: '14D'
      })
    });

    const postRes = await generateReadiness(postReq);
    expect(postRes.status).toBe(200);
    const postData = await postRes.json();
    expect(postData.predictionId).toBeDefined();
    expect(postData.snapshotId).toBeDefined();

    // 2. Search
    const getReq = new NextRequest('http://localhost/api/v1/readiness?profileId=prof-1', {
      method: 'GET',
      headers: { 'x-student-id': 'stud-1' }
    });

    const getRes = await searchReadiness(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.predictions.length).toBe(1);
  });

  test('GET api/v1/readiness/latest endpoint', async () => {
    const req = new NextRequest('http://localhost/api/v1/readiness/latest?profileId=prof-1', {
      method: 'GET',
      headers: { 'x-student-id': 'stud-1' }
    });

    const res = await getLatestReadiness(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('pred-1');
  });

  test('GET api/v1/readiness/history endpoint', async () => {
    const req = new NextRequest('http://localhost/api/v1/readiness/history?profileId=prof-1&limit=5', {
      method: 'GET',
      headers: { 'x-student-id': 'stud-1' }
    });

    const res = await getReadinessHistory(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.history.length).toBe(1);
  });

  test('POST & GET api/v1/readiness/experiments workflow', async () => {
    // 1. Create
    const createReq = new NextRequest('http://localhost/api/v1/readiness/experiments', {
      method: 'POST',
      body: JSON.stringify({
        experimentCode: 'EXP-1',
        displayName: 'Experiment 1',
        controlModelVersionId: 'control-1',
        challengerModelVersionId: 'challenger-1',
        trafficSplitPercentage: 50
      })
    });
    const createRes = await createExp(createReq);
    expect(createRes.status).toBe(200);
    const createData = await createRes.json();
    expect(createData.experimentId).toBeDefined();

    // 2. Start
    const startReq = new NextRequest(`http://localhost/api/v1/readiness/experiments/${createData.experimentId}/start`, {
      method: 'POST'
    });
    const startRes = await startExp(startReq, { params: Promise.resolve({ id: createData.experimentId }) });
    expect(startRes.status).toBe(200);

    // 3. Get Active
    const getReq = new NextRequest('http://localhost/api/v1/readiness/experiments', {
      method: 'GET'
    });
    const getRes = await getActiveExp(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.active).not.toBeNull();

    // 4. Complete
    const completeReq = new NextRequest(`http://localhost/api/v1/readiness/experiments/${createData.experimentId}/complete`, {
      method: 'POST'
    });
    const completeRes = await completeExp(completeReq, { params: Promise.resolve({ id: createData.experimentId }) });
    expect(completeRes.status).toBe(200);
  });

  test('POST api/v1/readiness/predictions/[id]/publish endpoint', async () => {
    const req = new NextRequest('http://localhost/api/v1/readiness/predictions/pred-1/publish', {
      method: 'POST'
    });
    const res = await publishPred(req, { params: Promise.resolve({ id: 'pred-1' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  test('POST api/v1/readiness/predictions/[id]/interventions/[intId]/activate-complete-discard endpoints', async () => {
    // 1. Activate
    const actReq = new NextRequest('http://localhost/api/v1/readiness/predictions/pred-1/interventions/int-1/activate', {
      method: 'POST'
    });
    const actRes = await activateInter(actReq, { params: Promise.resolve({ id: 'pred-1', intId: 'int-1' }) });
    expect(actRes.status).toBe(200);

    // 2. Complete
    const compReq = new NextRequest('http://localhost/api/v1/readiness/predictions/pred-1/interventions/int-1/complete', {
      method: 'POST'
    });
    const compRes = await completeInter(compReq, { params: Promise.resolve({ id: 'pred-1', intId: 'int-1' }) });
    expect(compRes.status).toBe(200);

    // 3. Discard
    const discReq = new NextRequest('http://localhost/api/v1/readiness/predictions/pred-1/interventions/int-1/discard', {
      method: 'POST'
    });
    const discRes = await discardInter(discReq, { params: Promise.resolve({ id: 'pred-1', intId: 'int-1' }) });
    expect(discRes.status).toBe(200);
  });

  test('GET & POST api/v1/readiness/features catalogue endpoints', async () => {
    // 1. POST (register feature)
    const postReq = new NextRequest('http://localhost/api/v1/readiness/features', {
      method: 'POST',
      body: JSON.stringify({
        featureCode: 'ACCURACY_RATE',
        displayName: 'Average Accuracy Rate',
        sourceDomain: 'AI Evaluation',
        normalizationMethod: 'MinMax',
        defaultWeight: 0.70,
        version: 'v1.0.0',
        description: 'Test feature'
      })
    });
    const postRes = await registerFeature(postReq);
    expect(postRes.status).toBe(201);
    const postData = await postRes.json();
    expect(postData.featureId).toBeDefined();

    // 2. GET (list features)
    const getReq = new NextRequest('http://localhost/api/v1/readiness/features', {
      method: 'GET'
    });
    const getRes = await getFeatures(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.features.length).toBe(1);
    expect(getData.features[0].featureCode).toBe('ACCURACY_RATE');
  });

  test('GET api/v1/readiness/interventions/catalogue template endpoint', async () => {
    const getReq = new NextRequest('http://localhost/api/v1/readiness/interventions/catalogue', {
      method: 'GET'
    });
    const getRes = await getInterventionsCatalogue(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.templates.length).toBe(1);
    expect(getData.templates[0].interventionType).toBe('GRAMMAR_HELP');
  });

  test('POST api/v1/readiness/predictions/[id]/outcome endpoint', async () => {
    const postReq = new NextRequest('http://localhost/api/v1/readiness/predictions/pred-1/outcome', {
      method: 'POST',
      headers: { 'x-student-id': 'stud-1' },
      body: JSON.stringify({
        actualScore: 8.0
      })
    });

    const postRes = await recordOutcome(postReq, { params: Promise.resolve({ id: 'pred-1' }) });
    expect(postRes.status).toBe(200);
    const postData = await postRes.json();
    expect(postData.success).toBe(true);
    expect(postData.outcomeId).toBeDefined();
  });

  test('GET & POST api/v1/readiness/metrics endpoint', async () => {
    // 1. POST (calculate metrics)
    const postReq = new NextRequest('http://localhost/api/v1/readiness/metrics', {
      method: 'POST',
      body: JSON.stringify({ modelVersionId: 'mv-1' })
    });
    const postRes = await calculateLifecycleMetrics(postReq);
    if (postRes.status !== 201) {
      console.error("METRICS POST FAILED:", await postRes.json());
    }
    expect(postRes.status).toBe(201);
    const postData = await postRes.json();
    expect(postData.metricsId).toBeDefined();

    // 2. GET (retrieve metrics)
    const getReq = new NextRequest('http://localhost/api/v1/readiness/metrics?modelVersionId=mv-1', {
      method: 'GET'
    });
    const getRes = await getLifecycleMetrics(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.metrics).toBeDefined();
    expect(getData.metrics.modelVersionId).toBe('mv-1');
  });
});
