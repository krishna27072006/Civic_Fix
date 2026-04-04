import { query } from '../config/db.js';
import { CATEGORY_MAP, STATUS_MAP, VOTE_THRESHOLD_PERCENT } from '../constants.js';

function categoryInfo(categoryId) {
  return CATEGORY_MAP.find((item) => item.id === categoryId) || CATEGORY_MAP[CATEGORY_MAP.length - 1];
}

function serializeIssueRow(row) {
  const category = categoryInfo(row.category);
  const upvotes = Number(row.upvote_count || 0);
  const satisfiedVotes = Number(row.satisfied_votes || 0);
  const notSatisfiedVotes = Number(row.not_satisfied_votes || 0);
  const totalVotes = satisfiedVotes + notSatisfiedVotes;
  const satisfactionPercent = totalVotes ? Math.round((satisfiedVotes / totalVotes) * 100) : 0;

  return {
    id: Number(row.id),
    title: row.title,
    description: row.description,
    category: row.category,
    categoryInfo: category,
    location: row.location_text,
    area: row.area,
    city: row.city,
    lat: Number(row.lat),
    lng: Number(row.lng),
    imageUrl: row.image_url,
    urgency: row.urgency,
    status: row.status,
    statusInfo: STATUS_MAP[row.status] || { label: row.status },
    heatScore: Number(row.heat_score),
    commentsCount: Number(row.comments_count || 0),
    upvotes,
    reportedAt: row.reported_at,
    resolvedAt: row.resolved_at,
    daysOpen: Number(row.days_open || 0),
    reportedBy: {
      id: row.reporter_id,
      name: row.reporter_name,
      anonymous: row.reporter_is_anonymous
    },
    progressUpdateCount: Number(row.progress_update_count || 0),
    voteSummary: {
      satisfied: satisfiedVotes,
      notSatisfied: notSatisfiedVotes,
      total: totalVotes,
      satisfactionPercent,
      thresholdPercent: VOTE_THRESHOLD_PERCENT
    },
    resolutionRequest: row.proof_image_url
      ? {
          summary: row.resolution_summary,
          proofImageUrl: row.proof_image_url,
          requestedAt: row.resolution_requested_at,
          outcomeStatus: row.resolution_outcome_status
        }
      : null,
    reviewCount: Number(row.review_count || 0),
    averageRating: row.average_rating ? Number(Number(row.average_rating).toFixed(1)) : null,
    viewer: {
      hasUpvoted: Boolean(row.viewer_has_upvoted),
      hasVoted: Boolean(row.viewer_has_voted)
    }
  };
}

export async function getIssueList({
  filters = '',
  params = [],
  orderBy = 'i.heat_score DESC',
  limit = 12,
  offset = 0,
  viewerUserId = null
}) {
  const result = await query(
    `
      SELECT
        i.*,
        GREATEST(0, DATE_PART('day', NOW() - i.reported_at))::int AS days_open,
        COALESCE(u.upvote_count, 0) AS upvote_count,
        COALESCE(up.progress_update_count, 0) AS progress_update_count,
        COALESCE(v.satisfied_votes, 0) AS satisfied_votes,
        COALESCE(v.not_satisfied_votes, 0) AS not_satisfied_votes,
        COALESCE(rv.review_count, 0) AS review_count,
        rv.average_rating,
        rr.summary AS resolution_summary,
        rr.proof_image_url,
        rr.requested_at AS resolution_requested_at,
        rr.outcome_status AS resolution_outcome_status,
        CASE
          WHEN $${params.length + 3}::uuid IS NULL THEN FALSE
          ELSE EXISTS (
            SELECT 1
            FROM issue_upvotes iu_viewer
            WHERE iu_viewer.issue_id = i.id AND iu_viewer.user_id = $${params.length + 3}::uuid
          )
        END AS viewer_has_upvoted,
        CASE
          WHEN $${params.length + 3}::uuid IS NULL THEN FALSE
          ELSE EXISTS (
            SELECT 1
            FROM issue_votes iv_viewer
            WHERE iv_viewer.issue_id = i.id AND iv_viewer.user_id = $${params.length + 3}::uuid
          )
        END AS viewer_has_voted
      FROM issues i
      LEFT JOIN (
        SELECT issue_id, COUNT(*)::int AS upvote_count
        FROM issue_upvotes
        GROUP BY issue_id
      ) u ON u.issue_id = i.id
      LEFT JOIN (
        SELECT issue_id, COUNT(*)::int AS progress_update_count
        FROM issue_updates
        GROUP BY issue_id
      ) up ON up.issue_id = i.id
      LEFT JOIN (
        SELECT
          issue_id,
          COUNT(*) FILTER (WHERE satisfied = TRUE)::int AS satisfied_votes,
          COUNT(*) FILTER (WHERE satisfied = FALSE)::int AS not_satisfied_votes
        FROM issue_votes
        GROUP BY issue_id
      ) v ON v.issue_id = i.id
      LEFT JOIN (
        SELECT issue_id, COUNT(*)::int AS review_count, AVG(rating)::numeric(10,2) AS average_rating
        FROM issue_reviews
        GROUP BY issue_id
      ) rv ON rv.issue_id = i.id
      LEFT JOIN issue_resolution_requests rr ON rr.issue_id = i.id
      ${filters}
      ORDER BY ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `,
    [...params, limit, offset, viewerUserId]
  );

  return result.rows.map(serializeIssueRow);
}

export async function getIssueById(issueId, viewerUserId = null) {
  const result = await getIssueList({
    filters: 'WHERE i.id = $1',
    params: [issueId],
    limit: 1,
    offset: 0,
    viewerUserId
  });

  if (!result[0]) {
    return null;
  }

  const [updatesResult, reviewsResult] = await Promise.all([
    query(
      `SELECT id, admin_id, admin_name, update_type, message, eta_date, created_at
       FROM issue_updates
       WHERE issue_id = $1
       ORDER BY created_at ASC`,
      [issueId]
    ),
    query(
      `SELECT id, user_id, user_name, rating, review_text, created_at
       FROM issue_reviews
       WHERE issue_id = $1
       ORDER BY created_at DESC`,
      [issueId]
    )
  ]);

  return {
    ...result[0],
    progressUpdates: updatesResult.rows.map((row) => ({
      id: Number(row.id),
      adminId: row.admin_id,
      adminName: row.admin_name,
      updateType: row.update_type,
      message: row.message,
      etaDate: row.eta_date,
      createdAt: row.created_at
    })),
    reviews: reviewsResult.rows.map((row) => ({
      id: Number(row.id),
      userId: row.user_id,
      userName: row.user_name,
      rating: Number(row.rating),
      reviewText: row.review_text,
      createdAt: row.created_at
    }))
  };
}

export async function notifyUsers({ userIds, issueId, type, title, body, metadata = {} }) {
  const uniqueUserIds = [...new Set((userIds || []).filter(Boolean))];
  if (!uniqueUserIds.length) {
    return;
  }

  const values = [];
  const params = [];
  let idx = 1;

  for (const userId of uniqueUserIds) {
    values.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}::jsonb)`);
    params.push(userId, issueId, type, title, body, JSON.stringify(metadata));
  }

  await query(
    `INSERT INTO notifications (user_id, issue_id, type, title, body, metadata)
     VALUES ${values.join(', ')}`,
    params
  );
}

export async function recomputeHeatScore(issueId) {
  await query(
    `
      UPDATE issues i
      SET heat_score = LEAST(
        100,
        GREATEST(
          10,
          (
            20
            + (SELECT COALESCE(COUNT(*), 0) * 3 FROM issue_upvotes WHERE issue_id = i.id)
            + (CASE i.urgency WHEN 'high' THEN 20 WHEN 'medium' THEN 10 ELSE 0 END)
            + LEAST(20, GREATEST(0, DATE_PART('day', NOW() - i.reported_at))::int)
            + (CASE i.status WHEN 'escalated' THEN 12 WHEN 'progress' THEN 6 WHEN 'awaiting_review' THEN 4 WHEN 'resolved' THEN -15 ELSE 0 END)
          )
        )
      ),
      updated_at = NOW()
      WHERE i.id = $1
    `,
    [issueId]
  );
}

export async function getVoteDecision(issueId) {
  const voteResult = await query(
    `
      SELECT
        COUNT(*) FILTER (WHERE satisfied = TRUE)::int AS satisfied_votes,
        COUNT(*) FILTER (WHERE satisfied = FALSE)::int AS not_satisfied_votes
      FROM issue_votes
      WHERE issue_id = $1
    `,
    [issueId]
  );

  const issueResult = await query(
    `
      SELECT
        i.id,
        i.title,
        COALESCE(u.upvote_count, 0) AS upvote_count
      FROM issues i
      LEFT JOIN (
        SELECT issue_id, COUNT(*)::int AS upvote_count
        FROM issue_upvotes
        GROUP BY issue_id
      ) u ON u.issue_id = i.id
      WHERE i.id = $1
    `,
    [issueId]
  );

  const issue = issueResult.rows[0];
  const tally = voteResult.rows[0];
  const satisfiedVotes = Number(tally.satisfied_votes || 0);
  const notSatisfiedVotes = Number(tally.not_satisfied_votes || 0);
  const totalVotes = satisfiedVotes + notSatisfiedVotes;
  const minVotes = Math.max(3, Math.floor(Number(issue.upvote_count || 0) * 0.05));
  const satisfactionPercent = totalVotes ? Math.round((satisfiedVotes / totalVotes) * 100) : 0;

  if (totalVotes < minVotes) {
    return {
      decided: false,
      totalVotes,
      minVotes,
      satisfactionPercent
    };
  }

  return {
    decided: true,
    outcomeStatus: satisfactionPercent >= VOTE_THRESHOLD_PERCENT ? 'resolved' : 'unsolved',
    totalVotes,
    minVotes,
    satisfactionPercent,
    title: issue.title
  };
}
