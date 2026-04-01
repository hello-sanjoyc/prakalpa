-- MySQL schema for Government Project Management
-- Use InnoDB, utf8mb4

CREATE TABLE departments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(64) NOT NULL UNIQUE,
  parent_id BIGINT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  INDEX (code),
  FOREIGN KEY (parent_id) REFERENCES departments(id)
);

CREATE TABLE roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE role_permissions (
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

CREATE TABLE members (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(15) NOT NULL UNIQUE,
  secondary_phone VARCHAR(15) NULL,
  whatsapp VARCHAR(15) NULL,
  designation VARCHAR(255) NULL,
  department_id BIGINT NULL,
  avatar_path VARCHAR(1024) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  INDEX (department_id)
);

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id BIGINT NOT NULL,
  username VARCHAR(150) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  department_id BIGINT NULL,
  vendor_id BIGINT NULL,
  is_active TINYINT DEFAULT 1,
  version INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  -- department_id = 0 indicates a global (non-department) assignment
  department_id BIGINT NOT NULL DEFAULT 0,
  version INT DEFAULT 1,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id, department_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  INDEX (department_id)
);

CREATE TABLE vendors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  registration_no VARCHAR(128),
  contact_email VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
);

CREATE TABLE projects (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(128) NOT NULL UNIQUE,
  title VARCHAR(512) NOT NULL,
  department_id BIGINT NOT NULL,
  owner_id BIGINT NOT NULL,
  fin_year VARCHAR(9) NULL,
  budget DECIMAL(18,2) DEFAULT 0,
  fund_allocated DECIMAL(18,2) DEFAULT 0,
  fund_consumed DECIMAL(18,2) DEFAULT 0,
  current_stage_id INT NOT NULL,
  rag_status ENUM('RED','AMBER','GREEN') DEFAULT 'GREEN',
  rag_manual_override TINYINT(1) DEFAULT 0,
  rag_override_reason TEXT NULL,
  start_date DATE,
  end_date DATE,
  revised_start_date DATE,
  revised_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  version INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE project_members (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  member_id BIGINT NOT NULL,
  role VARCHAR(64) DEFAULT 'MEMBER',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (member_id) REFERENCES members(id),
  INDEX (project_id),
  INDEX (member_id)
);

CREATE TABLE project_member_roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  name VARCHAR(64) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY project_member_roles_project_id_name_unique (project_id, name),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE project_stages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stage_order INT NOT NULL,
  stage_slug VARCHAR(128) NOT NULL,
  approved_by BIGINT NULL,
  approved_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY project_stages_stage_order_unique (stage_order),
  UNIQUE KEY project_stages_stage_slug_unique (stage_slug)
);

CREATE TABLE milestones (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  title VARCHAR(512) NOT NULL,
  due_date DATE NULL,
  status ENUM('PENDING','IN_PROGRESS','COMPLETE') DEFAULT 'PENDING',
  deleted_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE tasks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  milestone_id BIGINT NOT NULL,
  title VARCHAR(512) NOT NULL,
  description TEXT,
  owner_id BIGINT NULL,
  sla_hours INT NULL,
  due_date DATETIME NULL,
  priority ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
  status ENUM('OPEN','IN_PROGRESS','BLOCKED','DONE') DEFAULT 'OPEN',
  dependencies JSON NULL,
  deleted_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version INT DEFAULT 1,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE actions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  task_id BIGINT NOT NULL,
  title VARCHAR(512) NOT NULL,
  owner_id BIGINT NULL,
  due_date DATETIME NULL,
  status ENUM('OPEN','DONE') DEFAULT 'OPEN',
  evidence JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE project_files (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  parent_id BIGINT NULL,
  uploaded_by BIGINT NULL,
  name VARCHAR(512) NOT NULL,
  path VARCHAR(1024) NOT NULL,
  is_folder BOOLEAN DEFAULT FALSE,
  share_scope ENUM('only_me','all_members','selected') DEFAULT 'only_me',
  mime_type VARCHAR(128) NULL,
  size_bytes BIGINT NULL,
  shared_with JSON NULL,
  deleted_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (parent_id) REFERENCES project_files(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_project_files_project ON project_files(project_id);
CREATE INDEX idx_project_files_parent ON project_files(parent_id);

CREATE TABLE project_finances (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  entry_date DATE NOT NULL,
  fund_allocated DECIMAL(18,2) NOT NULL,
  fund_consumed DECIMAL(18,2) NOT NULL,
  note TEXT NULL,
  deleted_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_project_finances_project ON project_finances(project_id);

CREATE TABLE approvals (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  stage_id INT NULL,
  approver_id BIGINT NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  comments TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  acted_at DATETIME NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (approver_id) REFERENCES users(id)
);

CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT NULL,
  actor_role VARCHAR(255) NULL,
  ip_address VARCHAR(64) NULL,
  entity_type VARCHAR(128) NOT NULL,
  entity_id VARCHAR(128) NOT NULL,
  action VARCHAR(128) NOT NULL,
  -- renamed to avoid reserved keyword conflicts; use LONGTEXT for portability (MariaDB)
  before_state LONGTEXT NULL,
  after_state LONGTEXT NULL,
  tx_id VARCHAR(128) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (entity_type, entity_id),
  FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE TABLE notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NULL,
  payload JSON NOT NULL,
  type VARCHAR(128) NOT NULL,
  status ENUM('PENDING','SENT','FAILED') DEFAULT 'PENDING',
  attempts INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE rag_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NULL,
  milestone_id BIGINT NULL,
  task_id BIGINT NULL,
  previous_status ENUM('RED','AMBER','GREEN') NULL,
  new_status ENUM('RED','AMBER','GREEN') NOT NULL,
  reason TEXT NULL,
  created_by BIGINT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indexing and performance notes
CREATE INDEX idx_projects_department ON projects(department_id);
CREATE INDEX idx_tasks_owner ON tasks(owner_id);


/* superadmin@pms.gov — SuperAdmin!23
deptadmin@mo.infra — DeptAdmin!23
officer@dor.gov — Officer!23
finance@mo.infra — Finance!23
approver@mo.infra — Approver!23
auditor@audit.gov — Auditor!23
vendor@acme.com — Vendor!23 */
