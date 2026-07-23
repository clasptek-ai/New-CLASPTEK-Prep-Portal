import React, { useState } from 'react';
import { Pagination } from './Pagination';

export default {
  title: 'Navigation/Pagination',
  component: Pagination,
};

export const Default = () => {
  const [page, setPage] = useState(1);
  return <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />;
};
