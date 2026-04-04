export function buildPagination(page = 1, limit = 12) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 100);

  return {
    page: safePage,
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit
  };
}

export function mapSort(sort) {
  switch (sort) {
    case 'recent':
      return 'i.reported_at DESC';
    case 'upvotes':
      return 'upvote_count DESC, i.reported_at DESC';
    case 'days':
      return 'days_open DESC, i.reported_at ASC';
    case 'heat':
    default:
      return 'i.heat_score DESC, upvote_count DESC';
  }
}
