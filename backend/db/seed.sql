INSERT INTO users (id, first_name, last_name, email, phone, password_hash, role, avatar_text, area, city, lat, lng)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin', 'Priya', 'admin@civicfix.com', '+91 9000000001', '$2a$10$puY7N3eGxaJk18.W0cgQpuq9BVdGJ3BOLHTl59gnty8BRDVRw.waq', 'admin', 'A', 'MG Road', 'Bengaluru', 12.971600, 77.594600),
  ('22222222-2222-2222-2222-222222222222', 'User', 'Citizen', 'user@civicfix.com', '+91 9000000002', '$2a$10$g26MHRExkHq5jbZtmAJ0..KiBPaWuCKwiI3PMvpz/Do94peK2cLzK', 'citizen', 'U', 'Koramangala', 'Bengaluru', 12.935200, 77.624500),
  ('33333333-3333-3333-3333-333333333333', 'Rahul', 'Sharma', 'rahul@civicfix.com', '+91 9000000003', '$2a$10$g26MHRExkHq5jbZtmAJ0..KiBPaWuCKwiI3PMvpz/Do94peK2cLzK', 'citizen', 'R', 'Indiranagar', 'Bengaluru', 12.978400, 77.640800);

INSERT INTO issues (
  id, title, description, category, location_text, area, city, lat, lng, image_url, urgency, status, heat_score, comments_count, reporter_id, reporter_name, reporter_is_anonymous, reported_at
)
VALUES
  (1, 'Deep pothole near MG Road junction', 'A massive pothole has developed at the MG Road junction causing accidents.', 'pothole', 'MG Road, Bengaluru', 'MG Road', 'Bengaluru', 12.971600, 77.594600, 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80', 'high', 'escalated', 94, 12, '33333333-3333-3333-3333-333333333333', 'Rahul Sharma', FALSE, NOW() - INTERVAL '8 days'),
  (2, 'Overflowing garbage dump', 'Garbage collection point has not been cleared in 10 days.', 'garbage', 'Koramangala 5th Block, Bengaluru', 'Koramangala', 'Bengaluru', 12.935200, 77.624500, 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80', 'high', 'escalated', 87, 7, '22222222-2222-2222-2222-222222222222', 'User Citizen', FALSE, NOW() - INTERVAL '10 days'),
  (3, 'No water supply for 5 days', 'Residents have been without water supply for 5 consecutive days.', 'water', 'Indiranagar 12th Main, Bengaluru', 'Indiranagar', 'Bengaluru', 12.978400, 77.640800, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 'high', 'progress', 82, 23, '33333333-3333-3333-3333-333333333333', 'Rahul Sharma', FALSE, NOW() - INTERVAL '5 days'),
  (4, 'Street lights not working', '12 consecutive street lights are non-functional.', 'streetlight', 'Whitefield Main Rd, Bengaluru', 'Whitefield', 'Bengaluru', 12.969800, 77.749900, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80', 'medium', 'open', 71, 5, '22222222-2222-2222-2222-222222222222', 'User Citizen', FALSE, NOW() - INTERVAL '21 days'),
  (5, 'Pothole on Sarjapur Road', 'The major pothole was fixed and is now awaiting community confirmation.', 'pothole', 'Sarjapur Road, Bengaluru', 'Sarjapur', 'Bengaluru', 12.901000, 77.677900, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80', 'medium', 'awaiting_review', 28, 4, '22222222-2222-2222-2222-222222222222', 'User Citizen', FALSE, NOW() - INTERVAL '3 days'),
  (6, 'Street light repaired at BTM Layout', 'Street light was fixed after 2 weeks.', 'streetlight', 'BTM Layout 2nd Stage, Bengaluru', 'BTM Layout', 'Bengaluru', 12.916500, 77.610100, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 'low', 'resolved', 18, 3, '22222222-2222-2222-2222-222222222222', 'User Citizen', FALSE, NOW() - INTERVAL '14 days');

SELECT setval('issues_id_seq', (SELECT MAX(id) FROM issues));

INSERT INTO issue_updates (issue_id, admin_id, admin_name, update_type, message, eta_date, created_at)
VALUES
  (1, '11111111-1111-1111-1111-111111111111', 'Admin Priya', 'escalated', 'BBMP team has been notified. Inspection scheduled.', CURRENT_DATE + 2, NOW() - INTERVAL '6 days'),
  (1, '11111111-1111-1111-1111-111111111111', 'Admin Priya', 'progress', 'Material procurement in progress. Work to start within 48 hours.', CURRENT_DATE + 1, NOW() - INTERVAL '4 days'),
  (3, '11111111-1111-1111-1111-111111111111', 'Admin Priya', 'progress', 'Pipe burst identified. Repair crew deployed.', CURRENT_DATE + 1, NOW() - INTERVAL '3 days'),
  (6, '11111111-1111-1111-1111-111111111111', 'Admin Priya', 'progress', 'Street light replaced and tested working.', CURRENT_DATE - 1, NOW() - INTERVAL '1 day');

INSERT INTO issue_resolution_requests (issue_id, admin_id, admin_name, summary, proof_image_url, requested_at)
VALUES
  (5, '11111111-1111-1111-1111-111111111111', 'Admin Priya', 'Road patched successfully. Quality check passed.', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80', NOW() - INTERVAL '1 day');

INSERT INTO issue_upvotes (issue_id, user_id)
VALUES
  (1, '22222222-2222-2222-2222-222222222222'),
  (1, '33333333-3333-3333-3333-333333333333'),
  (2, '33333333-3333-3333-3333-333333333333'),
  (3, '22222222-2222-2222-2222-222222222222'),
  (5, '33333333-3333-3333-3333-333333333333');

INSERT INTO issue_reviews (issue_id, user_id, user_name, rating, review_text, created_at)
VALUES
  (6, '22222222-2222-2222-2222-222222222222', 'User Citizen', 5, 'Finally fixed. Works perfectly now.', NOW() - INTERVAL '12 hours');

INSERT INTO issue_votes (issue_id, user_id, satisfied, created_at)
VALUES
  (5, '22222222-2222-2222-2222-222222222222', TRUE, NOW() - INTERVAL '12 hours'),
  (5, '33333333-3333-3333-3333-333333333333', TRUE, NOW() - INTERVAL '8 hours');

INSERT INTO notifications (user_id, issue_id, type, title, body, read, created_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', 1, 'progress', 'Progress update on your issue', 'BBMP team has been notified for the pothole near MG Road.', FALSE, NOW() - INTERVAL '2 hours'),
  ('22222222-2222-2222-2222-222222222222', 5, 'vote_request', 'Cast your vote', 'Admin uploaded proof for the Sarjapur pothole fix.', FALSE, NOW() - INTERVAL '5 hours'),
  ('33333333-3333-3333-3333-333333333333', 2, 'escalated', 'Issue escalated', 'Overflowing garbage dump has been escalated to authorities.', TRUE, NOW() - INTERVAL '1 day');
