-- Sample seed data for project_members
INSERT INTO project_members (project_id, member_id, role) VALUES
((SELECT id FROM projects WHERE code = 'INF-001'), (SELECT id FROM members WHERE email = 'deptadmin@mo.infra'), 'PM'),
((SELECT id FROM projects WHERE code = 'INF-001'), (SELECT id FROM members WHERE email = 'officer@dor.gov'), 'LEAD'),
((SELECT id FROM projects WHERE code = 'INF-001'), (SELECT id FROM members WHERE email = 'finance@mo.infra'), 'SPOC'),
((SELECT id FROM projects WHERE code = 'INF-001'), (SELECT id FROM members WHERE email = 'superadmin@pms.gov'), 'MEMBER'),
((SELECT id FROM projects WHERE code = 'DOR-201'), (SELECT id FROM members WHERE email = 'officer@dor.gov'), 'PM'),
((SELECT id FROM projects WHERE code = 'DOR-201'), (SELECT id FROM members WHERE email = 'deptadmin@mo.infra'), 'SPOC'),
((SELECT id FROM projects WHERE code = 'DOR-201'), (SELECT id FROM members WHERE email = 'auditor@audit.gov'), 'MEMBER');
