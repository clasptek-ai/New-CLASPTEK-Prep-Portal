import { useState, useMemo, useCallback } from 'react';
import { AdminQuestion, QuestionWorkflowStatus, DifficultyLevel } from '../../../../services/admin/questions.service';

export type SelectionMode = 'NONE' | 'PAGE' | 'FILTERED' | 'ENTIRE_BANK';

export type SmartSelectionType =
  | 'ALL_PAGE'
  | 'PUBLISHED'
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'MISSING_EXPLANATION'
  | 'HARD_DIFFICULTY'
  | 'UNASSIGNED_PASSAGE';

export function useBulkSelection(allFilteredQuestions: AdminQuestion[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAllFiltered, setSelectAllFiltered] = useState<boolean>(false);

  const selectedCount = useMemo(() => {
    if (selectAllFiltered) {
      return allFilteredQuestions.length;
    }
    return selectedIds.size;
  }, [selectedIds, selectAllFiltered, allFilteredQuestions.length]);

  const selectionMode = useMemo<SelectionMode>(() => {
    if (selectAllFiltered) return 'FILTERED';
    if (selectedIds.size === 0) return 'NONE';
    if (selectedIds.size === allFilteredQuestions.length && allFilteredQuestions.length > 0) {
      return 'PAGE';
    }
    return 'PAGE';
  }, [selectedIds, selectAllFiltered, allFilteredQuestions.length]);

  const toggleSelectOne = useCallback((id: string) => {
    setSelectAllFiltered(false);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectPage = useCallback((pageIds: string[]) => {
    setSelectAllFiltered(false);
    setSelectedIds((prev) => {
      const allSelected = pageIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, []);

  const selectAllFilteredResults = useCallback(() => {
    setSelectAllFiltered(true);
    const allIds = new Set(allFilteredQuestions.map((q) => q.id));
    setSelectedIds(allIds);
  }, [allFilteredQuestions]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectAllFiltered(false);
  }, []);

  const selectBySmartCriteria = useCallback((criteria: SmartSelectionType, currentQuestions: AdminQuestion[]) => {
    setSelectAllFiltered(false);
    let targetQuestions: AdminQuestion[] = [];

    switch (criteria) {
      case 'ALL_PAGE':
        targetQuestions = currentQuestions;
        break;
      case 'PUBLISHED':
        targetQuestions = currentQuestions.filter((q) => q.status === 'PUBLISHED');
        break;
      case 'DRAFT':
        targetQuestions = currentQuestions.filter((q) => q.status === 'DRAFT');
        break;
      case 'UNDER_REVIEW':
        targetQuestions = currentQuestions.filter((q) => q.status === 'UNDER_REVIEW');
        break;
      case 'MISSING_EXPLANATION':
        targetQuestions = currentQuestions.filter((q) => !q.explanation || !q.explanation.trim());
        break;
      case 'HARD_DIFFICULTY':
        targetQuestions = currentQuestions.filter((q) => q.difficulty === 'HARD');
        break;
      case 'UNASSIGNED_PASSAGE':
        targetQuestions = currentQuestions.filter((q) => !q.passageId && !q.passageTitle);
        break;
      default:
        targetQuestions = currentQuestions;
    }

    const nextSet = new Set(targetQuestions.map((q) => q.id));
    setSelectedIds(nextSet);
  }, []);

  const isSelected = useCallback(
    (id: string) => {
      if (selectAllFiltered) return true;
      return selectedIds.has(id);
    },
    [selectedIds, selectAllFiltered]
  );

  return {
    selectedIds: Array.from(selectedIds),
    selectedSet: selectedIds,
    selectedCount,
    selectAllFiltered,
    selectionMode,
    isSelected,
    toggleSelectOne,
    toggleSelectPage,
    selectAllFilteredResults,
    clearSelection,
    selectBySmartCriteria,
  };
}
