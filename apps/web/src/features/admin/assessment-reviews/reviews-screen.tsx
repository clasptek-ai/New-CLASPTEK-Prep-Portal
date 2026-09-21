'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer, PageContent } from '../../../shared/ui/layout/PageContainer';
import {
  adminAssessmentReviewsService,
  AssessmentReviewAttempt,
  ReconstructedAttemptDetail,
} from '../../../services/admin/assessment-reviews.service';
import { AttemptHistoryDirectory } from './components/AttemptHistoryDirectory';
import { CandidateAttemptAuditView } from './components/CandidateAttemptAuditView';

export function AssessmentReviewsScreen() {
  const [attempts, setAttempts] = useState<AssessmentReviewAttempt[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<ReconstructedAttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminAssessmentReviewsService.getAttempts();
        setAttempts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSelectAttempt(attemptId: string) {
    setLoadingDetail(true);
    try {
      const detail = await adminAssessmentReviewsService.getAttemptDetail(attemptId);
      if (detail) {
        setSelectedDetail(detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <PageContainer>
      <PageContent>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>Loading student assessment attempts & history...</h3>
          </div>
        ) : loadingDetail ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>Reconstructing candidate examination attempt evidence...</h3>
          </div>
        ) : selectedDetail ? (
          <CandidateAttemptAuditView
            detail={selectedDetail}
            onBack={() => setSelectedDetail(null)}
          />
        ) : (
          <AttemptHistoryDirectory attempts={attempts} onSelectAttempt={handleSelectAttempt} />
        )}
      </PageContent>
    </PageContainer>
  );
}

export default AssessmentReviewsScreen;
