-- Initial seed: roles, permissions, departments, stages, and admin user placeholder
START TRANSACTION;

INSERT INTO roles (name, slug) VALUES
('Super Admin', 'super_admin'),
('Department Admin', 'department_admin'),
('Project Officer', 'project_officer'),
('Finance Officer', 'finance_officer'),
('Approving Authority', 'approving_authority'),
('Vendor', 'vendor'),
('Auditor', 'auditor');

INSERT INTO permissions (name, slug) VALUES
('projects:create','projects.create'),
('projects:transition','projects.transition'),
('projects:view','projects.view'),
('documents:upload','documents.upload'),
('finance:approve','finance.approve');

-- Example departments
INSERT INTO departments (name, code) VALUES
('Ministry of Infrastructure', 'MOI'),
('Department of Roads', 'DOR');

-- Seed members
INSERT INTO members (full_name, email, phone, secondary_phone, whatsapp, designation, department_id) VALUES
('Super Admin', 'superadmin@pms.gov', '9000000001', NULL, '9000000001', 'Super Admin', NULL),
('Dept Admin', 'deptadmin@mo.infra', '9000000002', NULL, '9000000002', 'Department Admin', (SELECT id FROM departments WHERE code = 'MOI')),
('Project Officer', 'officer@dor.gov', '9000000003', NULL, '9000000003', 'Project Officer', (SELECT id FROM departments WHERE code = 'DOR')),
('Finance Officer', 'finance@mo.infra', '9000000004', NULL, '9000000004', 'Finance Officer', (SELECT id FROM departments WHERE code = 'MOI')),
('Approving Authority', 'approver@mo.infra', '9000000005', NULL, '9000000005', 'Approving Authority', (SELECT id FROM departments WHERE code = 'MOI')),
('Auditor', 'auditor@audit.gov', '9000000006', NULL, '9000000006', 'Auditor', NULL),
('Vendor', 'vendor@acme.com', '9000000007', NULL, '9000000007', 'Vendor', NULL);

-- Seed users
INSERT INTO users (member_id, username, email, password_hash, department_id, is_active) VALUES
((SELECT id FROM members WHERE email = 'superadmin@pms.gov'), 'superadmin', 'superadmin@pms.gov', '$2b$10$JpS/8xMp5uoSmSBkltRL4uMBVJ1eJ8wEmXcquDYCjiiLKkZllDz2S', NULL, 1),
((SELECT id FROM members WHERE email = 'deptadmin@mo.infra'), 'deptadmin', 'deptadmin@mo.infra', '$2b$10$4cNHGWy.JyqCqTumirgRfeaQwns5Jl5.OT7ryvkFwASZZfmq/mqbO', (SELECT id FROM departments WHERE code = 'MOI'), 1),
((SELECT id FROM members WHERE email = 'officer@dor.gov'), 'officer', 'officer@dor.gov', '$2b$10$/R.yF54r69YeOLLq4o9bBO7zftI9gEoYevVav1UvCqagAlkZtRMnq', (SELECT id FROM departments WHERE code = 'DOR'), 1),
((SELECT id FROM members WHERE email = 'finance@mo.infra'), 'finance', 'finance@mo.infra', '$2b$10$5xAOvpNv8KApIicNcsAyu.rw0qzieoUR3F1viAHAG5HvIuWjNeBRu', (SELECT id FROM departments WHERE code = 'MOI'), 1),
((SELECT id FROM members WHERE email = 'approver@mo.infra'), 'approver', 'approver@mo.infra', '$2b$10$Yz5x3hop9G9fBCnGohYSouWbft0e8TqszvSNe./gZ7Hfkx401De6W', (SELECT id FROM departments WHERE code = 'MOI'), 1),
((SELECT id FROM members WHERE email = 'auditor@audit.gov'), 'auditor', 'auditor@audit.gov', '$2b$10$PbMBYXSv6wsE0CHHVFtzAOZSzAZWOt1J83Z3GrPm0HDBtstrYifX2', NULL, 1),
((SELECT id FROM members WHERE email = 'vendor@acme.com'), 'vendor', 'vendor@acme.com', '$2b$10$PhFkNLP7M25uOTrM3yzNjuAI6dRKJ9sYfdLtaWgqhUXBeShcQa0Wq', NULL, 1);

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, department_id) VALUES
((SELECT id FROM users WHERE email = 'superadmin@pms.gov'), (SELECT id FROM roles WHERE slug = 'super_admin'), 0),
((SELECT id FROM users WHERE email = 'deptadmin@mo.infra'), (SELECT id FROM roles WHERE slug = 'department_admin'), (SELECT id FROM departments WHERE code = 'MOI')),
((SELECT id FROM users WHERE email = 'officer@dor.gov'), (SELECT id FROM roles WHERE slug = 'project_officer'), (SELECT id FROM departments WHERE code = 'DOR')),
((SELECT id FROM users WHERE email = 'finance@mo.infra'), (SELECT id FROM roles WHERE slug = 'finance_officer'), (SELECT id FROM departments WHERE code = 'MOI')),
((SELECT id FROM users WHERE email = 'approver@mo.infra'), (SELECT id FROM roles WHERE slug = 'approving_authority'), (SELECT id FROM departments WHERE code = 'MOI')),
((SELECT id FROM users WHERE email = 'auditor@audit.gov'), (SELECT id FROM roles WHERE slug = 'auditor'), 0),
((SELECT id FROM users WHERE email = 'vendor@acme.com'), (SELECT id FROM roles WHERE slug = 'vendor'), 0);

-- Seed projects
INSERT INTO projects (code, title, department_id, owner_id, budget, current_stage_id, rag_status, start_date, end_date) VALUES
('INF-001', 'Port Modernization', (SELECT id FROM departments WHERE code = 'MOI'), (SELECT id FROM users WHERE email = 'deptadmin@mo.infra'), 4200000.00, 1, 'AMBER', '2024-03-01', '2024-12-15'),
('DOR-201', 'Highway Corridor', (SELECT id FROM departments WHERE code = 'DOR'), (SELECT id FROM users WHERE email = 'officer@dor.gov'), 3100000.00, 1, 'GREEN', '2024-04-10', '2025-02-28');

-- Seed project stages
INSERT INTO project_stages (stage_order, stage_slug) VALUES
(1, 'Conceptualization'),
(2, 'Feasibility & DPR'),
(3, 'Administrative Approval'),
(4, 'Financial Sanction'),
(5, 'Procurement / Tendering'),
(6, 'Execution'),
(7, 'Monitoring & Control'),
(8, 'Testing & Acceptance'),
(9, 'Closure'),
(10, 'Audit & Evaluation');

-- Align project current_stage_id to first stage
UPDATE projects p
SET current_stage_id = (
    SELECT id FROM project_stages ps ORDER BY ps.stage_order LIMIT 1
)
WHERE p.code IN ('INF-001','DOR-201');

COMMIT;
