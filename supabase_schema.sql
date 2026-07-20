-- ENVIC HRMS Supabase Schema and Seed Data
-- Run this script in your Supabase SQL Editor to initialize your database.

-- Clean up existing tables
DROP TABLE IF EXISTS onboarding_tasks CASCADE;
DROP TABLE IF EXISTS activity_feed CASCADE;
DROP TABLE IF EXISTS performance_reviews CASCADE;
DROP TABLE IF EXISTS payroll_records CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- 1. Departments Table
CREATE TABLE departments (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  head_employee_id VARCHAR(50),
  budget NUMERIC(15, 2) NOT NULL,
  location VARCHAR(255) NOT NULL,
  color_hex VARCHAR(7) NOT NULL
);

-- 2. Employees Table
CREATE TABLE employees (
  id VARCHAR(50) PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  preferred_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  avatar_url TEXT NOT NULL,
  department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
  role VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  employment_type VARCHAR(50) NOT NULL,
  join_date DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  manager_id VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
  salary NUMERIC(15, 2) NOT NULL,
  gender VARCHAR(50) NOT NULL,
  date_of_birth DATE NOT NULL,
  address TEXT NOT NULL,
  nic VARCHAR(20) DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  shift VARCHAR(100) DEFAULT 'Morning Shift (9:00 AM - 5:00 PM)'
);

-- Set head_employee_id foreign key constraint now that employees table exists
ALTER TABLE departments ADD CONSTRAINT fk_head_employee FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- 3. Positions Table
CREATE TABLE positions (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
  location VARCHAR(255) NOT NULL,
  employment_type VARCHAR(50) NOT NULL,
  openings INT NOT NULL,
  posted_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL
);

-- 4. Candidates Table
CREATE TABLE candidates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatar_url TEXT NOT NULL,
  position_id VARCHAR(50) REFERENCES positions(id) ON DELETE SET NULL,
  stage VARCHAR(50) NOT NULL,
  applied_date DATE NOT NULL,
  rating INT NOT NULL,
  source VARCHAR(255) NOT NULL
);

-- 5. Leave Requests Table
CREATE TABLE leave_requests (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INT NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  requested_on DATE NOT NULL
);

-- 6. Attendance Records Table
CREATE TABLE attendance_records (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  clock_in VARCHAR(10),
  clock_out VARCHAR(10),
  hours NUMERIC(4, 2) NOT NULL
);

-- 7. Payroll Records Table
CREATE TABLE payroll_records (
  id VARCHAR(100) PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
  period VARCHAR(7) NOT NULL,
  base_salary NUMERIC(15, 2) NOT NULL,
  allowances NUMERIC(15, 2) NOT NULL,
  bonus NUMERIC(15, 2) NOT NULL,
  deductions NUMERIC(15, 2) NOT NULL,
  tax NUMERIC(15, 2) NOT NULL,
  net_pay NUMERIC(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  pay_date DATE
);

-- 8. Performance Reviews Table
CREATE TABLE performance_reviews (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
  cycle VARCHAR(50) NOT NULL,
  reviewer_id VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
  rating NUMERIC(3, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  summary TEXT NOT NULL,
  goals JSONB NOT NULL
);

-- 9. Onboarding Tasks Table
CREATE TABLE onboarding_tasks (
  id VARCHAR(50) PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  done BOOLEAN NOT NULL
);

-- 10. Activity Feed Table
CREATE TABLE activity_feed (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Seed Data Inserts

-- Seeding Departments (without head_employee_id first)
INSERT INTO departments (id, name, budget, location, color_hex) VALUES ('DEP-ENG', 'Engineering', 2400000, 'Remote / HQ', '#22d3ee');
INSERT INTO departments (id, name, budget, location, color_hex) VALUES ('DEP-DSN', 'Design', 820000, 'HQ', '#a78bfa');
INSERT INTO departments (id, name, budget, location, color_hex) VALUES ('DEP-MKT', 'Marketing', 1100000, 'HQ', '#f472b6');
INSERT INTO departments (id, name, budget, location, color_hex) VALUES ('DEP-SAL', 'Sales', 1500000, 'Remote', '#34d399');
INSERT INTO departments (id, name, budget, location, color_hex) VALUES ('DEP-HR', 'Human Resources', 560000, 'HQ', '#fbbf24');
INSERT INTO departments (id, name, budget, location, color_hex) VALUES ('DEP-OPS', 'Operations', 940000, 'HQ', '#60a5fa');
INSERT INTO departments (id, name, budget, location, color_hex) VALUES ('DEP-BD', 'Business Development', 600000, 'Remote / HQ', '#f87171');
INSERT INTO departments (id, name, budget, location, color_hex) VALUES ('DEP-DS', 'Digital Solution', 500000, 'HQ', '#38bdf8');


-- Seeding Employees
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1001', 'Nadia', 'Karim', 'nadia.karim@envicdigital.com', '+1 415 555 0101', 'https://api.dicebear.com/7.x/notionists/svg?seed=Nadia%20Karim&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-ENG', 'VP of Engineering', 'Active', 'Full-time', '2019-03-12', 'San Francisco, US', NULL, 245000, 'Female', '1986-07-21', '210 Mission St, San Francisco, CA');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1002', 'Marcus', 'Reyes', 'marcus.reyes@envicdigital.com', '+1 415 555 0102', 'https://api.dicebear.com/7.x/notionists/svg?seed=Marcus%20Reyes&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-ENG', 'Senior Backend Engineer', 'Active', 'Full-time', '2020-06-01', 'Austin, US', 'EMP-1001', 168000, 'Male', '1990-02-15', '88 Congress Ave, Austin, TX');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1003', 'Priya', 'Nair', 'priya.nair@envicdigital.com', '+1 415 555 0103', 'https://api.dicebear.com/7.x/notionists/svg?seed=Priya%20Nair&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-ENG', 'Frontend Engineer', 'Active', 'Full-time', '2021-09-20', 'Remote', 'EMP-1001', 142000, 'Female', '1993-11-03', 'Remote — Bengaluru, IN');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1004', 'Tomas', 'Andersen', 'tomas.andersen@envicdigital.com', '+1 415 555 0104', 'https://api.dicebear.com/7.x/notionists/svg?seed=Tomas%20Andersen&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-ENG', 'DevOps Engineer', 'Active', 'Full-time', '2022-01-10', 'Remote', 'EMP-1001', 155000, 'Male', '1991-05-30', 'Remote — Copenhagen, DK');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1005', 'Sofia', 'Mendez', 'sofia.mendez@envicdigital.com', '+1 415 555 0105', 'https://api.dicebear.com/7.x/notionists/svg?seed=Sofia%20Mendez&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-ENG', 'QA Engineer', 'On Leave', 'Full-time', '2021-04-18', 'HQ', 'EMP-1002', 118000, 'Female', '1994-09-12', '55 Market St, San Francisco, CA');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1006', 'Daniel', 'Owusu', 'daniel.owusu@envicdigital.com', '+1 415 555 0106', 'https://api.dicebear.com/7.x/notionists/svg?seed=Daniel%20Owusu&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-ENG', 'Machine Learning Engineer', 'Active', 'Full-time', '2022-08-01', 'Remote', 'EMP-1001', 172000, 'Male', '1992-12-08', 'Remote — Accra, GH');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1007', 'Elena', 'Volkova', 'elena.volkova@envicdigital.com', '+1 415 555 0107', 'https://api.dicebear.com/7.x/notionists/svg?seed=Elena%20Volkova&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-ENG', 'Junior Engineer', 'Probation', 'Full-time', '2026-05-04', 'HQ', 'EMP-1002', 98000, 'Female', '1999-03-22', '12 Beale St, San Francisco, CA');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1008', 'Kenji', 'Watanabe', 'kenji.watanabe@envicdigital.com', '+1 415 555 0108', 'https://api.dicebear.com/7.x/notionists/svg?seed=Kenji%20Watanabe&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-ENG', 'Platform Engineer', 'Active', 'Contract', '2023-02-15', 'Remote', 'EMP-1001', 160000, 'Male', '1988-06-17', 'Remote — Tokyo, JP');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1010', 'Aisha', 'Rahman', 'aisha.rahman@envicdigital.com', '+1 415 555 0110', 'https://api.dicebear.com/7.x/notionists/svg?seed=Aisha%20Rahman&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-DSN', 'Head of Design', 'Active', 'Full-time', '2019-08-05', 'HQ', NULL, 198000, 'Female', '1987-01-19', '400 Howard St, San Francisco, CA');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1011', 'Liam', 'O’Brien', 'liam.obrien@envicdigital.com', '+1 415 555 0111', 'https://api.dicebear.com/7.x/notionists/svg?seed=Liam%20OBrien&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-DSN', 'Senior Product Designer', 'Active', 'Full-time', '2020-11-11', 'HQ', 'EMP-1010', 148000, 'Male', '1990-10-02', '19 Fremont St, San Francisco, CA');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1012', 'Zoe', 'Fischer', 'zoe.fischer@envicdigital.com', '+1 415 555 0112', 'https://api.dicebear.com/7.x/notionists/svg?seed=Zoe%20Fischer&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-DSN', 'UX Researcher', 'Active', 'Full-time', '2022-03-28', 'Remote', 'EMP-1010', 124000, 'Female', '1995-04-14', 'Remote — Berlin, DE');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1013', 'Ravi', 'Patel', 'ravi.patel@envicdigital.com', '+1 415 555 0113', 'https://api.dicebear.com/7.x/notionists/svg?seed=Ravi%20Patel&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-DSN', 'Visual Designer', 'Active', 'Part-time', '2023-07-01', 'Remote', 'EMP-1010', 82000, 'Male', '1996-08-25', 'Remote — Toronto, CA');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1016', 'Grace', 'Thompson', 'grace.thompson@envicdigital.com', '+1 415 555 0116', 'https://api.dicebear.com/7.x/notionists/svg?seed=Grace%20Thompson&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-MKT', 'Marketing Director', 'Active', 'Full-time', '2020-02-17', 'HQ', NULL, 186000, 'Female', '1985-12-11', '1 Market St, San Francisco, CA');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1017', 'Omar', 'Haddad', 'omar.haddad@envicdigital.com', '+1 415 555 0117', 'https://api.dicebear.com/7.x/notionists/svg?seed=Omar%20Haddad&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-MKT', 'Content Strategist', 'Active', 'Full-time', '2021-06-14', 'Remote', 'EMP-1016', 108000, 'Male', '1992-03-09', 'Remote — Dubai, AE');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1018', 'Chloe', 'Martin', 'chloe.martin@envicdigital.com', '+1 415 555 0118', 'https://api.dicebear.com/7.x/notionists/svg?seed=Chloe%20Martin&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-MKT', 'Growth Marketer', 'Active', 'Full-time', '2022-10-03', 'HQ', 'EMP-1016', 112000, 'Female', '1994-07-27', '650 California St, San Francisco, CA');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1019', 'Noah', 'Kim', 'noah.kim@envicdigital.com', '+1 415 555 0119', 'https://api.dicebear.com/7.x/notionists/svg?seed=Noah%20Kim&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-MKT', 'Social Media Lead', 'On Leave', 'Full-time', '2023-01-23', 'Remote', 'EMP-1016', 96000, 'Male', '1997-11-16', 'Remote — Seoul, KR');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1022', 'Isabella', 'Rossi', 'isabella.rossi@envicdigital.com', '+1 415 555 0122', 'https://api.dicebear.com/7.x/notionists/svg?seed=Isabella%20Rossi&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-SAL', 'VP of Sales', 'Active', 'Full-time', '2019-05-20', 'HQ', NULL, 210000, 'Female', '1984-09-04', '300 Spear St, San Francisco, CA');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1023', 'James', 'Carter', 'james.carter@envicdigital.com', '+1 415 555 0123', 'https://api.dicebear.com/7.x/notionists/svg?seed=James%20Carter&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-SAL', 'Account Executive', 'Active', 'Full-time', '2021-03-08', 'Remote', 'EMP-1022', 128000, 'Male', '1991-01-28', 'Remote — Chicago, US');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1024', 'Fatima', 'Al-Sayed', 'fatima.alsayed@envicdigital.com', '+1 415 555 0124', 'https://api.dicebear.com/7.x/notionists/svg?seed=Fatima%20AlSayed&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-SAL', 'Sales Development Rep', 'Active', 'Full-time', '2023-04-17', 'Remote', 'EMP-1022', 86000, 'Female', '1998-06-30', 'Remote — Cairo, EG');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1025', 'Lucas', 'Silva', 'lucas.silva@envicdigital.com', '+1 415 555 0125', 'https://api.dicebear.com/7.x/notionists/svg?seed=Lucas%20Silva&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-SAL', 'Account Manager', 'Active', 'Full-time', '2022-07-25', 'Remote', 'EMP-1022', 118000, 'Male', '1993-02-19', 'Remote — São Paulo, BR');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1030', 'Hannah', 'Lee', 'hannah.lee@envicdigital.com', '+1 415 555 0130', 'https://api.dicebear.com/7.x/notionists/svg?seed=Hannah%20Lee&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-HR', 'Head of People', 'Active', 'Full-time', '2019-10-01', 'HQ', NULL, 176000, 'Female', '1986-05-08', '101 Second St, San Francisco, CA');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1031', 'David', 'Nguyen', 'david.nguyen@envicdigital.com', '+1 415 555 0131', 'https://api.dicebear.com/7.x/notionists/svg?seed=David%20Nguyen&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-HR', 'HR Business Partner', 'Active', 'Full-time', '2021-12-06', 'HQ', 'EMP-1030', 122000, 'Male', '1990-08-14', '75 Howard St, San Francisco, CA');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1032', 'Mia', 'Johansson', 'mia.johansson@envicdigital.com', '+1 415 555 0132', 'https://api.dicebear.com/7.x/notionists/svg?seed=Mia%20Johansson&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-HR', 'Recruiter', 'Active', 'Full-time', '2022-05-30', 'Remote', 'EMP-1030', 94000, 'Female', '1995-10-21', 'Remote — Stockholm, SE');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1034', 'Robert', 'Klein', 'robert.klein@envicdigital.com', '+1 415 555 0134', 'https://api.dicebear.com/7.x/notionists/svg?seed=Robert%20Klein&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-OPS', 'Head of Operations', 'Active', 'Full-time', '2020-01-15', 'HQ', NULL, 182000, 'Male', '1983-04-26', '500 Terry Francois Blvd, San Francisco, CA');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1035', 'Amara', 'Okafor', 'amara.okafor@envicdigital.com', '+1 415 555 0135', 'https://api.dicebear.com/7.x/notionists/svg?seed=Amara%20Okafor&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-OPS', 'Operations Analyst', 'Active', 'Full-time', '2022-09-12', 'Remote', 'EMP-1034', 104000, 'Female', '1994-12-05', 'Remote — Lagos, NG');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1036', 'Ethan', 'Brooks', 'ethan.brooks@envicdigital.com', '+1 415 555 0136', 'https://api.dicebear.com/7.x/notionists/svg?seed=Ethan%20Brooks&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-OPS', 'IT Support Specialist', 'Active', 'Full-time', '2023-03-06', 'HQ', 'EMP-1034', 88000, 'Male', '1996-02-11', '25 Lusk St, San Francisco, CA');
INSERT INTO employees (id, first_name, last_name, email, phone, avatar_url, department_id, role, status, employment_type, join_date, location, manager_id, salary, gender, date_of_birth, address) VALUES ('EMP-1037', 'Yuki', 'Tanaka', 'yuki.tanaka@envicdigital.com', '+1 415 555 0137', 'https://api.dicebear.com/7.x/notionists/svg?seed=Yuki%20Tanaka&backgroundColor=14171c,1a1d23,262a31&radius=50', 'DEP-OPS', 'Facilities Coordinator', 'Active', 'Intern', '2026-06-01', 'HQ', 'EMP-1034', 62000, 'Female', '2001-07-18', '38 Bluxome St, San Francisco, CA');

-- Linking Department Heads
UPDATE departments SET head_employee_id = 'EMP-1001' WHERE id = 'DEP-ENG';
UPDATE departments SET head_employee_id = 'EMP-1010' WHERE id = 'DEP-DSN';
UPDATE departments SET head_employee_id = 'EMP-1016' WHERE id = 'DEP-MKT';
UPDATE departments SET head_employee_id = 'EMP-1022' WHERE id = 'DEP-SAL';
UPDATE departments SET head_employee_id = 'EMP-1030' WHERE id = 'DEP-HR';
UPDATE departments SET head_employee_id = 'EMP-1034' WHERE id = 'DEP-OPS';

-- Seeding Positions
INSERT INTO positions (id, title, department_id, location, employment_type, openings, posted_date, status) VALUES ('POS-01', 'Senior Fullstack Engineer', 'DEP-ENG', 'Remote', 'Full-time', 2, '2026-06-15', 'Open');
INSERT INTO positions (id, title, department_id, location, employment_type, openings, posted_date, status) VALUES ('POS-02', 'Product Designer', 'DEP-DSN', 'HQ', 'Full-time', 1, '2026-06-28', 'Open');
INSERT INTO positions (id, title, department_id, location, employment_type, openings, posted_date, status) VALUES ('POS-03', 'Performance Marketing Manager', 'DEP-MKT', 'Remote', 'Full-time', 1, '2026-07-01', 'Open');
INSERT INTO positions (id, title, department_id, location, employment_type, openings, posted_date, status) VALUES ('POS-04', 'Enterprise Account Executive', 'DEP-SAL', 'Remote', 'Full-time', 3, '2026-05-20', 'Open');
INSERT INTO positions (id, title, department_id, location, employment_type, openings, posted_date, status) VALUES ('POS-05', 'Data Engineer', 'DEP-ENG', 'HQ', 'Full-time', 1, '2026-07-05', 'Open');

-- Seeding Candidates
INSERT INTO candidates (id, name, email, avatar_url, position_id, stage, applied_date, rating, source) VALUES ('CAN-01', 'Aria Blackwood', 'aria.b@example.com', 'https://api.dicebear.com/7.x/notionists/svg?seed=Aria%20Blackwood&backgroundColor=14171c,1a1d23,262a31&radius=50', 'POS-01', 'Applied', '2026-07-10', 3, 'LinkedIn');
INSERT INTO candidates (id, name, email, avatar_url, position_id, stage, applied_date, rating, source) VALUES ('CAN-02', 'Mateo Rivera', 'mateo.r@example.com', 'https://api.dicebear.com/7.x/notionists/svg?seed=Mateo%20Rivera&backgroundColor=14171c,1a1d23,262a31&radius=50', 'POS-01', 'Screening', '2026-07-06', 4, 'Referral');
INSERT INTO candidates (id, name, email, avatar_url, position_id, stage, applied_date, rating, source) VALUES ('CAN-03', 'Leah Goldberg', 'leah.g@example.com', 'https://api.dicebear.com/7.x/notionists/svg?seed=Leah%20Goldberg&backgroundColor=14171c,1a1d23,262a31&radius=50', 'POS-01', 'Interview', '2026-06-30', 5, 'Website');
INSERT INTO candidates (id, name, email, avatar_url, position_id, stage, applied_date, rating, source) VALUES ('CAN-04', 'Simon Wu', 'simon.w@example.com', 'https://api.dicebear.com/7.x/notionists/svg?seed=Simon%20Wu&backgroundColor=14171c,1a1d23,262a31&radius=50', 'POS-02', 'Interview', '2026-07-02', 4, 'Dribbble');
INSERT INTO candidates (id, name, email, avatar_url, position_id, stage, applied_date, rating, source) VALUES ('CAN-05', 'Nora Ahmed', 'nora.a@example.com', 'https://api.dicebear.com/7.x/notionists/svg?seed=Nora%20Ahmed&backgroundColor=14171c,1a1d23,262a31&radius=50', 'POS-02', 'Offer', '2026-06-22', 5, 'Referral');
INSERT INTO candidates (id, name, email, avatar_url, position_id, stage, applied_date, rating, source) VALUES ('CAN-06', 'Felix Berger', 'felix.b@example.com', 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix%20Berger&backgroundColor=14171c,1a1d23,262a31&radius=50', 'POS-03', 'Applied', '2026-07-11', 3, 'Indeed');
INSERT INTO candidates (id, name, email, avatar_url, position_id, stage, applied_date, rating, source) VALUES ('CAN-07', 'Priyanka Rao', 'priyanka.r@example.com', 'https://api.dicebear.com/7.x/notionists/svg?seed=Priyanka%20Rao&backgroundColor=14171c,1a1d23,262a31&radius=50', 'POS-03', 'Screening', '2026-07-08', 4, 'LinkedIn');
INSERT INTO candidates (id, name, email, avatar_url, position_id, stage, applied_date, rating, source) VALUES ('CAN-08', 'Diego Fernandez', 'diego.f@example.com', 'https://api.dicebear.com/7.x/notionists/svg?seed=Diego%20Fernandez&backgroundColor=14171c,1a1d23,262a31&radius=50', 'POS-04', 'Applied', '2026-07-12', 3, 'LinkedIn');
INSERT INTO candidates (id, name, email, avatar_url, position_id, stage, applied_date, rating, source) VALUES ('CAN-09', 'Hana Suzuki', 'hana.s@example.com', 'https://api.dicebear.com/7.x/notionists/svg?seed=Hana%20Suzuki&backgroundColor=14171c,1a1d23,262a31&radius=50', 'POS-04', 'Interview', '2026-06-26', 4, 'Website');
INSERT INTO candidates (id, name, email, avatar_url, position_id, stage, applied_date, rating, source) VALUES ('CAN-10', 'Oscar Lindqvist', 'oscar.l@example.com', 'https://api.dicebear.com/7.x/notionists/svg?seed=Oscar%20Lindqvist&backgroundColor=14171c,1a1d23,262a31&radius=50', 'POS-04', 'Hired', '2026-05-30', 5, 'Referral');
INSERT INTO candidates (id, name, email, avatar_url, position_id, stage, applied_date, rating, source) VALUES ('CAN-11', 'Yasmin Farah', 'yasmin.f@example.com', 'https://api.dicebear.com/7.x/notionists/svg?seed=Yasmin%20Farah&backgroundColor=14171c,1a1d23,262a31&radius=50', 'POS-05', 'Screening', '2026-07-09', 4, 'Website');
INSERT INTO candidates (id, name, email, avatar_url, position_id, stage, applied_date, rating, source) VALUES ('CAN-12', 'Ben Carlson', 'ben.c@example.com', 'https://api.dicebear.com/7.x/notionists/svg?seed=Ben%20Carlson&backgroundColor=14171c,1a1d23,262a31&radius=50', 'POS-05', 'Offer', '2026-06-18', 5, 'Referral');

-- Seeding Leave Requests
INSERT INTO leave_requests (id, employee_id, type, start_date, end_date, days, reason, status, requested_on) VALUES ('LV-2001', 'EMP-1005', 'Sick', '2026-07-12', '2026-07-16', 5, 'Medical recovery after minor surgery.', 'Approved', '2026-07-10');
INSERT INTO leave_requests (id, employee_id, type, start_date, end_date, days, reason, status, requested_on) VALUES ('LV-2002', 'EMP-1019', 'Annual', '2026-07-13', '2026-07-20', 6, 'Family holiday abroad.', 'Approved', '2026-06-28');
INSERT INTO leave_requests (id, employee_id, type, start_date, end_date, days, reason, status, requested_on) VALUES ('LV-2003', 'EMP-1003', 'Annual', '2026-07-21', '2026-07-25', 5, 'Personal time off.', 'Pending', '2026-07-11');
INSERT INTO leave_requests (id, employee_id, type, start_date, end_date, days, reason, status, requested_on) VALUES ('LV-2004', 'EMP-1023', 'Sick', '2026-07-15', '2026-07-15', 1, 'Doctor appointment.', 'Pending', '2026-07-13');
INSERT INTO leave_requests (id, employee_id, type, start_date, end_date, days, reason, status, requested_on) VALUES ('LV-2005', 'EMP-1013', 'Unpaid', '2026-08-01', '2026-08-14', 10, 'Extended personal travel.', 'Pending', '2026-07-09');
INSERT INTO leave_requests (id, employee_id, type, start_date, end_date, days, reason, status, requested_on) VALUES ('LV-2006', 'EMP-1017', 'Parental', '2026-09-01', '2026-11-24', 60, 'Paternity leave — new baby.', 'Pending', '2026-07-08');
INSERT INTO leave_requests (id, employee_id, type, start_date, end_date, days, reason, status, requested_on) VALUES ('LV-2007', 'EMP-1035', 'Annual', '2026-07-28', '2026-07-30', 3, 'Long weekend break.', 'Pending', '2026-07-12');
INSERT INTO leave_requests (id, employee_id, type, start_date, end_date, days, reason, status, requested_on) VALUES ('LV-2008', 'EMP-1011', 'Sick', '2026-07-02', '2026-07-03', 2, 'Flu.', 'Approved', '2026-07-01');
INSERT INTO leave_requests (id, employee_id, type, start_date, end_date, days, reason, status, requested_on) VALUES ('LV-2009', 'EMP-1024', 'Annual', '2026-06-10', '2026-06-14', 5, 'Vacation.', 'Rejected', '2026-06-01');
INSERT INTO leave_requests (id, employee_id, type, start_date, end_date, days, reason, status, requested_on) VALUES ('LV-2010', 'EMP-1032', 'Bereavement', '2026-07-16', '2026-07-18', 3, 'Family bereavement.', 'Pending', '2026-07-14');

-- Seeding Attendance Records
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-1', 'EMP-1001', '2026-07-14', 'Present', '08:00', '17:00', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-2', 'EMP-1002', '2026-07-14', 'Present', '09:31', '18:49', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-3', 'EMP-1003', '2026-07-14', 'Present', '08:02', '17:38', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-4', 'EMP-1004', '2026-07-14', 'WFH', '09:33', '18:27', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-5', 'EMP-1005', '2026-07-14', 'On Leave', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-6', 'EMP-1006', '2026-07-14', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-7', 'EMP-1007', '2026-07-14', 'Present', '08:06', '17:54', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-8', 'EMP-1008', '2026-07-14', 'Present', '09:37', '18:43', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-9', 'EMP-1010', '2026-07-14', 'Present', '08:08', '17:32', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-10', 'EMP-1011', '2026-07-14', 'WFH', '09:39', '18:21', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-11', 'EMP-1012', '2026-07-14', 'Late', '09:10', '17:10', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-12', 'EMP-1013', '2026-07-14', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-13', 'EMP-1016', '2026-07-14', 'Present', '08:12', '17:48', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-14', 'EMP-1017', '2026-07-14', 'Present', '09:43', '18:37', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-15', 'EMP-1018', '2026-07-14', 'Present', '08:14', '17:26', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-16', 'EMP-1019', '2026-07-14', 'On Leave', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-17', 'EMP-1022', '2026-07-14', 'Late', '09:16', '17:04', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-18', 'EMP-1023', '2026-07-14', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-19', 'EMP-1024', '2026-07-14', 'Present', '08:18', '17:42', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-20', 'EMP-1025', '2026-07-14', 'Present', '09:49', '18:31', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-21', 'EMP-1030', '2026-07-14', 'Present', '08:20', '17:20', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-22', 'EMP-1031', '2026-07-14', 'WFH', '09:51', '18:09', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-23', 'EMP-1032', '2026-07-14', 'Late', '09:22', '17:58', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-24', 'EMP-1034', '2026-07-14', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-25', 'EMP-1035', '2026-07-14', 'Present', '08:24', '17:36', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-26', 'EMP-1036', '2026-07-14', 'Present', '09:55', '18:25', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-27', 'EMP-1037', '2026-07-14', 'Present', '08:26', '17:14', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-28', 'EMP-1001', '2026-07-13', 'WFH', '09:39', '18:21', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-29', 'EMP-1002', '2026-07-13', 'Late', '09:10', '17:10', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-30', 'EMP-1003', '2026-07-13', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-31', 'EMP-1004', '2026-07-13', 'Present', '08:12', '17:48', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-32', 'EMP-1005', '2026-07-13', 'On Leave', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-33', 'EMP-1006', '2026-07-13', 'Present', '08:14', '17:26', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-34', 'EMP-1007', '2026-07-13', 'WFH', '09:45', '18:15', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-35', 'EMP-1008', '2026-07-13', 'Late', '09:16', '17:04', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-36', 'EMP-1010', '2026-07-13', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-37', 'EMP-1011', '2026-07-13', 'Present', '08:18', '17:42', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-38', 'EMP-1012', '2026-07-13', 'Present', '09:49', '18:31', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-39', 'EMP-1013', '2026-07-13', 'Present', '08:20', '17:20', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-40', 'EMP-1016', '2026-07-13', 'WFH', '09:51', '18:09', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-41', 'EMP-1017', '2026-07-13', 'Late', '09:22', '17:58', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-42', 'EMP-1018', '2026-07-13', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-43', 'EMP-1019', '2026-07-13', 'On Leave', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-44', 'EMP-1022', '2026-07-13', 'Present', '09:55', '18:25', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-45', 'EMP-1023', '2026-07-13', 'Present', '08:26', '17:14', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-46', 'EMP-1024', '2026-07-13', 'WFH', '09:57', '18:03', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-47', 'EMP-1025', '2026-07-13', 'Late', '09:28', '17:52', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-48', 'EMP-1030', '2026-07-13', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-49', 'EMP-1031', '2026-07-13', 'Present', '08:30', '17:30', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-50', 'EMP-1032', '2026-07-13', 'Present', '09:01', '18:19', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-51', 'EMP-1034', '2026-07-13', 'Present', '08:32', '17:08', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-52', 'EMP-1035', '2026-07-13', 'WFH', '09:03', '18:57', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-53', 'EMP-1036', '2026-07-13', 'Late', '09:34', '17:46', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-54', 'EMP-1037', '2026-07-13', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-55', 'EMP-1001', '2026-07-10', 'Present', '08:36', '17:24', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-56', 'EMP-1002', '2026-07-10', 'Present', '09:07', '18:13', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-57', 'EMP-1003', '2026-07-10', 'Present', '08:38', '17:02', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-58', 'EMP-1004', '2026-07-10', 'WFH', '09:09', '18:51', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-59', 'EMP-1005', '2026-07-10', 'On Leave', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-60', 'EMP-1006', '2026-07-10', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-61', 'EMP-1007', '2026-07-10', 'Present', '08:42', '17:18', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-62', 'EMP-1008', '2026-07-10', 'Present', '09:13', '18:07', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-63', 'EMP-1010', '2026-07-10', 'Present', '08:44', '17:56', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-64', 'EMP-1011', '2026-07-10', 'WFH', '09:15', '18:45', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-65', 'EMP-1012', '2026-07-10', 'Late', '09:46', '17:34', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-66', 'EMP-1013', '2026-07-10', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-67', 'EMP-1016', '2026-07-10', 'Present', '08:48', '17:12', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-68', 'EMP-1017', '2026-07-10', 'Present', '09:19', '18:01', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-69', 'EMP-1018', '2026-07-10', 'Present', '08:50', '17:50', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-70', 'EMP-1019', '2026-07-10', 'On Leave', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-71', 'EMP-1022', '2026-07-10', 'Late', '09:52', '17:28', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-72', 'EMP-1023', '2026-07-10', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-73', 'EMP-1024', '2026-07-10', 'Present', '08:54', '17:06', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-74', 'EMP-1025', '2026-07-10', 'Present', '09:25', '18:55', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-75', 'EMP-1030', '2026-07-10', 'Present', '08:56', '17:44', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-76', 'EMP-1031', '2026-07-10', 'WFH', '09:27', '18:33', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-77', 'EMP-1032', '2026-07-10', 'Late', '09:58', '17:22', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-78', 'EMP-1034', '2026-07-10', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-79', 'EMP-1035', '2026-07-10', 'Present', '08:00', '17:00', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-80', 'EMP-1036', '2026-07-10', 'Present', '09:31', '18:49', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-81', 'EMP-1037', '2026-07-10', 'Present', '08:02', '17:38', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-82', 'EMP-1001', '2026-07-09', 'WFH', '09:15', '18:45', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-83', 'EMP-1002', '2026-07-09', 'Late', '09:46', '17:34', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-84', 'EMP-1003', '2026-07-09', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-85', 'EMP-1004', '2026-07-09', 'Present', '08:48', '17:12', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-86', 'EMP-1005', '2026-07-09', 'Present', '09:19', '18:01', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-87', 'EMP-1006', '2026-07-09', 'Present', '08:50', '17:50', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-88', 'EMP-1007', '2026-07-09', 'WFH', '09:21', '18:39', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-89', 'EMP-1008', '2026-07-09', 'Late', '09:52', '17:28', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-90', 'EMP-1010', '2026-07-09', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-91', 'EMP-1011', '2026-07-09', 'Present', '08:54', '17:06', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-92', 'EMP-1012', '2026-07-09', 'Present', '09:25', '18:55', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-93', 'EMP-1013', '2026-07-09', 'Present', '08:56', '17:44', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-94', 'EMP-1016', '2026-07-09', 'WFH', '09:27', '18:33', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-95', 'EMP-1017', '2026-07-09', 'Late', '09:58', '17:22', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-96', 'EMP-1018', '2026-07-09', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-97', 'EMP-1019', '2026-07-09', 'Present', '08:00', '17:00', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-98', 'EMP-1022', '2026-07-09', 'Present', '09:31', '18:49', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-99', 'EMP-1023', '2026-07-09', 'Present', '08:02', '17:38', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-100', 'EMP-1024', '2026-07-09', 'WFH', '09:33', '18:27', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-101', 'EMP-1025', '2026-07-09', 'Late', '09:04', '17:16', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-102', 'EMP-1030', '2026-07-09', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-103', 'EMP-1031', '2026-07-09', 'Present', '08:06', '17:54', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-104', 'EMP-1032', '2026-07-09', 'Present', '09:37', '18:43', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-105', 'EMP-1034', '2026-07-09', 'Present', '08:08', '17:32', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-106', 'EMP-1035', '2026-07-09', 'WFH', '09:39', '18:21', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-107', 'EMP-1036', '2026-07-09', 'Late', '09:10', '17:10', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-108', 'EMP-1037', '2026-07-09', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-109', 'EMP-1001', '2026-07-08', 'Present', '08:54', '17:06', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-110', 'EMP-1002', '2026-07-08', 'Present', '09:25', '18:55', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-111', 'EMP-1003', '2026-07-08', 'Present', '08:56', '17:44', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-112', 'EMP-1004', '2026-07-08', 'WFH', '09:27', '18:33', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-113', 'EMP-1005', '2026-07-08', 'Late', '09:58', '17:22', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-114', 'EMP-1006', '2026-07-08', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-115', 'EMP-1007', '2026-07-08', 'Present', '08:00', '17:00', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-116', 'EMP-1008', '2026-07-08', 'Present', '09:31', '18:49', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-117', 'EMP-1010', '2026-07-08', 'Present', '08:02', '17:38', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-118', 'EMP-1011', '2026-07-08', 'WFH', '09:33', '18:27', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-119', 'EMP-1012', '2026-07-08', 'Late', '09:04', '17:16', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-120', 'EMP-1013', '2026-07-08', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-121', 'EMP-1016', '2026-07-08', 'Present', '08:06', '17:54', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-122', 'EMP-1017', '2026-07-08', 'Present', '09:37', '18:43', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-123', 'EMP-1018', '2026-07-08', 'Present', '08:08', '17:32', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-124', 'EMP-1019', '2026-07-08', 'WFH', '09:39', '18:21', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-125', 'EMP-1022', '2026-07-08', 'Late', '09:10', '17:10', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-126', 'EMP-1023', '2026-07-08', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-127', 'EMP-1024', '2026-07-08', 'Present', '08:12', '17:48', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-128', 'EMP-1025', '2026-07-08', 'Present', '09:43', '18:37', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-129', 'EMP-1030', '2026-07-08', 'Present', '08:14', '17:26', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-130', 'EMP-1031', '2026-07-08', 'WFH', '09:45', '18:15', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-131', 'EMP-1032', '2026-07-08', 'Late', '09:16', '17:04', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-132', 'EMP-1034', '2026-07-08', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-133', 'EMP-1035', '2026-07-08', 'Present', '08:18', '17:42', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-134', 'EMP-1036', '2026-07-08', 'Present', '09:49', '18:31', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-135', 'EMP-1037', '2026-07-08', 'Present', '08:20', '17:20', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-136', 'EMP-1001', '2026-07-07', 'WFH', '09:33', '18:27', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-137', 'EMP-1002', '2026-07-07', 'Late', '09:04', '17:16', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-138', 'EMP-1003', '2026-07-07', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-139', 'EMP-1004', '2026-07-07', 'Present', '08:06', '17:54', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-140', 'EMP-1005', '2026-07-07', 'Present', '09:37', '18:43', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-141', 'EMP-1006', '2026-07-07', 'Present', '08:08', '17:32', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-142', 'EMP-1007', '2026-07-07', 'WFH', '09:39', '18:21', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-143', 'EMP-1008', '2026-07-07', 'Late', '09:10', '17:10', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-144', 'EMP-1010', '2026-07-07', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-145', 'EMP-1011', '2026-07-07', 'Present', '08:12', '17:48', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-146', 'EMP-1012', '2026-07-07', 'Present', '09:43', '18:37', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-147', 'EMP-1013', '2026-07-07', 'Present', '08:14', '17:26', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-148', 'EMP-1016', '2026-07-07', 'WFH', '09:45', '18:15', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-149', 'EMP-1017', '2026-07-07', 'Late', '09:16', '17:04', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-150', 'EMP-1018', '2026-07-07', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-151', 'EMP-1019', '2026-07-07', 'Present', '08:18', '17:42', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-152', 'EMP-1022', '2026-07-07', 'Present', '09:49', '18:31', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-153', 'EMP-1023', '2026-07-07', 'Present', '08:20', '17:20', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-154', 'EMP-1024', '2026-07-07', 'WFH', '09:51', '18:09', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-155', 'EMP-1025', '2026-07-07', 'Late', '09:22', '17:58', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-156', 'EMP-1030', '2026-07-07', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-157', 'EMP-1031', '2026-07-07', 'Present', '08:24', '17:36', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-158', 'EMP-1032', '2026-07-07', 'Present', '09:55', '18:25', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-159', 'EMP-1034', '2026-07-07', 'Present', '08:26', '17:14', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-160', 'EMP-1035', '2026-07-07', 'WFH', '09:57', '18:03', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-161', 'EMP-1036', '2026-07-07', 'Late', '09:28', '17:52', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-162', 'EMP-1037', '2026-07-07', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-163', 'EMP-1001', '2026-07-06', 'Present', '08:12', '17:48', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-164', 'EMP-1002', '2026-07-06', 'Present', '09:43', '18:37', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-165', 'EMP-1003', '2026-07-06', 'Present', '08:14', '17:26', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-166', 'EMP-1004', '2026-07-06', 'WFH', '09:45', '18:15', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-167', 'EMP-1005', '2026-07-06', 'Late', '09:16', '17:04', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-168', 'EMP-1006', '2026-07-06', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-169', 'EMP-1007', '2026-07-06', 'Present', '08:18', '17:42', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-170', 'EMP-1008', '2026-07-06', 'Present', '09:49', '18:31', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-171', 'EMP-1010', '2026-07-06', 'Present', '08:20', '17:20', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-172', 'EMP-1011', '2026-07-06', 'WFH', '09:51', '18:09', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-173', 'EMP-1012', '2026-07-06', 'Late', '09:22', '17:58', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-174', 'EMP-1013', '2026-07-06', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-175', 'EMP-1016', '2026-07-06', 'Present', '08:24', '17:36', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-176', 'EMP-1017', '2026-07-06', 'Present', '09:55', '18:25', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-177', 'EMP-1018', '2026-07-06', 'Present', '08:26', '17:14', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-178', 'EMP-1019', '2026-07-06', 'WFH', '09:57', '18:03', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-179', 'EMP-1022', '2026-07-06', 'Late', '09:28', '17:52', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-180', 'EMP-1023', '2026-07-06', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-181', 'EMP-1024', '2026-07-06', 'Present', '08:30', '17:30', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-182', 'EMP-1025', '2026-07-06', 'Present', '09:01', '18:19', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-183', 'EMP-1030', '2026-07-06', 'Present', '08:32', '17:08', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-184', 'EMP-1031', '2026-07-06', 'WFH', '09:03', '18:57', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-185', 'EMP-1032', '2026-07-06', 'Late', '09:34', '17:46', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-186', 'EMP-1034', '2026-07-06', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-187', 'EMP-1035', '2026-07-06', 'Present', '08:36', '17:24', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-188', 'EMP-1036', '2026-07-06', 'Present', '09:07', '18:13', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-189', 'EMP-1037', '2026-07-06', 'Present', '08:38', '17:02', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-190', 'EMP-1001', '2026-07-03', 'WFH', '09:09', '18:51', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-191', 'EMP-1002', '2026-07-03', 'Late', '09:40', '17:40', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-192', 'EMP-1003', '2026-07-03', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-193', 'EMP-1004', '2026-07-03', 'Present', '08:42', '17:18', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-194', 'EMP-1005', '2026-07-03', 'Present', '09:13', '18:07', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-195', 'EMP-1006', '2026-07-03', 'Present', '08:44', '17:56', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-196', 'EMP-1007', '2026-07-03', 'WFH', '09:15', '18:45', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-197', 'EMP-1008', '2026-07-03', 'Late', '09:46', '17:34', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-198', 'EMP-1010', '2026-07-03', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-199', 'EMP-1011', '2026-07-03', 'Present', '08:48', '17:12', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-200', 'EMP-1012', '2026-07-03', 'Present', '09:19', '18:01', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-201', 'EMP-1013', '2026-07-03', 'Present', '08:50', '17:50', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-202', 'EMP-1016', '2026-07-03', 'WFH', '09:21', '18:39', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-203', 'EMP-1017', '2026-07-03', 'Late', '09:52', '17:28', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-204', 'EMP-1018', '2026-07-03', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-205', 'EMP-1019', '2026-07-03', 'Present', '08:54', '17:06', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-206', 'EMP-1022', '2026-07-03', 'Present', '09:25', '18:55', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-207', 'EMP-1023', '2026-07-03', 'Present', '08:56', '17:44', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-208', 'EMP-1024', '2026-07-03', 'WFH', '09:27', '18:33', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-209', 'EMP-1025', '2026-07-03', 'Late', '09:58', '17:22', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-210', 'EMP-1030', '2026-07-03', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-211', 'EMP-1031', '2026-07-03', 'Present', '08:00', '17:00', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-212', 'EMP-1032', '2026-07-03', 'Present', '09:31', '18:49', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-213', 'EMP-1034', '2026-07-03', 'Present', '08:02', '17:38', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-214', 'EMP-1035', '2026-07-03', 'WFH', '09:33', '18:27', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-215', 'EMP-1036', '2026-07-03', 'Late', '09:04', '17:16', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-216', 'EMP-1037', '2026-07-03', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-217', 'EMP-1001', '2026-07-02', 'Present', '08:48', '17:12', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-218', 'EMP-1002', '2026-07-02', 'Present', '09:19', '18:01', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-219', 'EMP-1003', '2026-07-02', 'Present', '08:50', '17:50', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-220', 'EMP-1004', '2026-07-02', 'WFH', '09:21', '18:39', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-221', 'EMP-1005', '2026-07-02', 'Late', '09:52', '17:28', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-222', 'EMP-1006', '2026-07-02', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-223', 'EMP-1007', '2026-07-02', 'Present', '08:54', '17:06', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-224', 'EMP-1008', '2026-07-02', 'Present', '09:25', '18:55', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-225', 'EMP-1010', '2026-07-02', 'Present', '08:56', '17:44', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-226', 'EMP-1011', '2026-07-02', 'WFH', '09:27', '18:33', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-227', 'EMP-1012', '2026-07-02', 'Late', '09:58', '17:22', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-228', 'EMP-1013', '2026-07-02', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-229', 'EMP-1016', '2026-07-02', 'Present', '08:00', '17:00', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-230', 'EMP-1017', '2026-07-02', 'Present', '09:31', '18:49', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-231', 'EMP-1018', '2026-07-02', 'Present', '08:02', '17:38', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-232', 'EMP-1019', '2026-07-02', 'WFH', '09:33', '18:27', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-233', 'EMP-1022', '2026-07-02', 'Late', '09:04', '17:16', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-234', 'EMP-1023', '2026-07-02', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-235', 'EMP-1024', '2026-07-02', 'Present', '08:06', '17:54', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-236', 'EMP-1025', '2026-07-02', 'Present', '09:37', '18:43', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-237', 'EMP-1030', '2026-07-02', 'Present', '08:08', '17:32', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-238', 'EMP-1031', '2026-07-02', 'WFH', '09:39', '18:21', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-239', 'EMP-1032', '2026-07-02', 'Late', '09:10', '17:10', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-240', 'EMP-1034', '2026-07-02', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-241', 'EMP-1035', '2026-07-02', 'Present', '08:12', '17:48', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-242', 'EMP-1036', '2026-07-02', 'Present', '09:43', '18:37', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-243', 'EMP-1037', '2026-07-02', 'Present', '08:14', '17:26', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-244', 'EMP-1001', '2026-07-01', 'WFH', '09:27', '18:33', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-245', 'EMP-1002', '2026-07-01', 'Late', '09:58', '17:22', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-246', 'EMP-1003', '2026-07-01', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-247', 'EMP-1004', '2026-07-01', 'Present', '08:00', '17:00', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-248', 'EMP-1005', '2026-07-01', 'Present', '09:31', '18:49', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-249', 'EMP-1006', '2026-07-01', 'Present', '08:02', '17:38', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-250', 'EMP-1007', '2026-07-01', 'WFH', '09:33', '18:27', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-251', 'EMP-1008', '2026-07-01', 'Late', '09:04', '17:16', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-252', 'EMP-1010', '2026-07-01', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-253', 'EMP-1011', '2026-07-01', 'Present', '08:06', '17:54', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-254', 'EMP-1012', '2026-07-01', 'Present', '09:37', '18:43', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-255', 'EMP-1013', '2026-07-01', 'Present', '08:08', '17:32', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-256', 'EMP-1016', '2026-07-01', 'WFH', '09:39', '18:21', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-257', 'EMP-1017', '2026-07-01', 'Late', '09:10', '17:10', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-258', 'EMP-1018', '2026-07-01', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-259', 'EMP-1019', '2026-07-01', 'Present', '08:12', '17:48', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-260', 'EMP-1022', '2026-07-01', 'Present', '09:43', '18:37', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-261', 'EMP-1023', '2026-07-01', 'Present', '08:14', '17:26', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-262', 'EMP-1024', '2026-07-01', 'WFH', '09:45', '18:15', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-263', 'EMP-1025', '2026-07-01', 'Late', '09:16', '17:04', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-264', 'EMP-1030', '2026-07-01', 'Absent', NULL, NULL, 0);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-265', 'EMP-1031', '2026-07-01', 'Present', '08:18', '17:42', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-266', 'EMP-1032', '2026-07-01', 'Present', '09:49', '18:31', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-267', 'EMP-1034', '2026-07-01', 'Present', '08:20', '17:20', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-268', 'EMP-1035', '2026-07-01', 'WFH', '09:51', '18:09', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-269', 'EMP-1036', '2026-07-01', 'Late', '09:22', '17:58', 9);
INSERT INTO attendance_records (id, employee_id, date, status, clock_in, clock_out, hours) VALUES ('ATT-270', 'EMP-1037', '2026-07-01', 'Absent', NULL, NULL, 0);

-- Seeding Payroll Records
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1001-2026-06', 'EMP-1001', '2026-06', 20417, 1633, 3063, 5513, 4492, 19600, 'Pending', NULL);
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1002-2026-06', 'EMP-1002', '2026-06', 14000, 1120, 0, 3780, 3080, 11340, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1003-2026-06', 'EMP-1003', '2026-06', 11833, 947, 0, 3195, 2603, 9585, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1004-2026-06', 'EMP-1004', '2026-06', 12917, 1033, 0, 3488, 2842, 10462, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1005-2026-06', 'EMP-1005', '2026-06', 9833, 787, 0, 2655, 2163, 7965, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1006-2026-06', 'EMP-1006', '2026-06', 14333, 1147, 2150, 3870, 3153, 13760, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1007-2026-06', 'EMP-1007', '2026-06', 8167, 653, 0, 2205, 1797, 6615, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1008-2026-06', 'EMP-1008', '2026-06', 13333, 1067, 0, 3600, 2933, 10800, 'Pending', NULL);
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1010-2026-06', 'EMP-1010', '2026-06', 16500, 1320, 0, 4455, 3630, 13365, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1011-2026-06', 'EMP-1011', '2026-06', 12333, 987, 0, 3330, 2713, 9990, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1012-2026-06', 'EMP-1012', '2026-06', 10333, 827, 1550, 2790, 2273, 9920, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1013-2026-06', 'EMP-1013', '2026-06', 6833, 547, 0, 1845, 1503, 5535, 'Processing', NULL);
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1016-2026-06', 'EMP-1016', '2026-06', 15500, 1240, 0, 4185, 3410, 12555, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1017-2026-06', 'EMP-1017', '2026-06', 9000, 720, 0, 2430, 1980, 7290, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1018-2026-06', 'EMP-1018', '2026-06', 9333, 747, 0, 2520, 2053, 7560, 'Pending', NULL);
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1019-2026-06', 'EMP-1019', '2026-06', 8000, 640, 1200, 2160, 1760, 7680, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1022-2026-06', 'EMP-1022', '2026-06', 17500, 1400, 0, 4725, 3850, 14175, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1023-2026-06', 'EMP-1023', '2026-06', 10667, 853, 0, 2880, 2347, 8640, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1024-2026-06', 'EMP-1024', '2026-06', 7167, 573, 0, 1935, 1577, 5805, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1025-2026-06', 'EMP-1025', '2026-06', 9833, 787, 0, 2655, 2163, 7965, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1030-2026-06', 'EMP-1030', '2026-06', 14667, 1173, 2200, 3960, 3227, 14080, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1031-2026-06', 'EMP-1031', '2026-06', 10167, 813, 0, 2745, 2237, 8235, 'Pending', NULL);
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1032-2026-06', 'EMP-1032', '2026-06', 7833, 627, 0, 2115, 1723, 6345, 'Processing', NULL);
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1034-2026-06', 'EMP-1034', '2026-06', 15167, 1213, 0, 4095, 3337, 12285, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1035-2026-06', 'EMP-1035', '2026-06', 8667, 693, 0, 2340, 1907, 7020, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1036-2026-06', 'EMP-1036', '2026-06', 7333, 587, 1100, 1980, 1613, 7040, 'Paid', '2026-06-30');
INSERT INTO payroll_records (id, employee_id, period, base_salary, allowances, bonus, deductions, tax, net_pay, status, pay_date) VALUES ('PAY-EMP-1037-2026-06', 'EMP-1037', '2026-06', 5167, 413, 0, 1395, 1137, 4185, 'Paid', '2026-06-30');

-- Seeding Performance Reviews
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1001-H1', 'EMP-1001', 'H1 2026', 'EMP-1030', 4.5, 'Upcoming', '2026-07-25', 'Consistently exceeds expectations and mentors peers effectively.', '[{"label":"Deliver core roadmap items","progress":60},{"label":"Improve documentation coverage","progress":40},{"label":"Mentorship & knowledge sharing","progress":30}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1002-H1', 'EMP-1002', 'H1 2026', 'EMP-1001', 4.2, 'Completed', '2026-06-20', 'Strong contributor; delivered key projects on schedule.', '[{"label":"Deliver core roadmap items","progress":67},{"label":"Improve documentation coverage","progress":51},{"label":"Mentorship & knowledge sharing","progress":43}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1003-H1', 'EMP-1003', 'H1 2026', 'EMP-1001', 3.8, 'Completed', '2026-06-20', 'Solid performer with room to grow in cross-team collaboration.', '[{"label":"Deliver core roadmap items","progress":74},{"label":"Improve documentation coverage","progress":62},{"label":"Mentorship & knowledge sharing","progress":56}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1004-H1', 'EMP-1004', 'H1 2026', 'EMP-1001', 4.8, 'Completed', '2026-06-20', 'Outstanding impact this cycle; a role model for the team.', '[{"label":"Deliver core roadmap items","progress":81},{"label":"Improve documentation coverage","progress":73},{"label":"Mentorship & knowledge sharing","progress":69}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1005-H1', 'EMP-1005', 'H1 2026', 'EMP-1002', 3.5, 'Upcoming', '2026-07-25', 'Meeting expectations; focus areas identified for next quarter.', '[{"label":"Deliver core roadmap items","progress":88},{"label":"Improve documentation coverage","progress":84},{"label":"Mentorship & knowledge sharing","progress":82}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1006-H1', 'EMP-1006', 'H1 2026', 'EMP-1001', 4, 'Completed', '2026-06-20', 'Consistently exceeds expectations and mentors peers effectively.', '[{"label":"Deliver core roadmap items","progress":95},{"label":"Improve documentation coverage","progress":40},{"label":"Mentorship & knowledge sharing","progress":30}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1007-H1', 'EMP-1007', 'H1 2026', 'EMP-1002', 4.6, 'Completed', '2026-06-20', 'Strong contributor; delivered key projects on schedule.', '[{"label":"Deliver core roadmap items","progress":62},{"label":"Improve documentation coverage","progress":51},{"label":"Mentorship & knowledge sharing","progress":43}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1008-H1', 'EMP-1008', 'H1 2026', 'EMP-1001', 3.9, 'Completed', '2026-06-20', 'Solid performer with room to grow in cross-team collaboration.', '[{"label":"Deliver core roadmap items","progress":69},{"label":"Improve documentation coverage","progress":62},{"label":"Mentorship & knowledge sharing","progress":56}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1010-H1', 'EMP-1010', 'H1 2026', 'EMP-1030', 4.3, 'Upcoming', '2026-07-25', 'Outstanding impact this cycle; a role model for the team.', '[{"label":"Deliver core roadmap items","progress":76},{"label":"Improve documentation coverage","progress":73},{"label":"Mentorship & knowledge sharing","progress":69}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1011-H1', 'EMP-1011', 'H1 2026', 'EMP-1010', 5, 'In Progress', '2026-06-20', 'Meeting expectations; focus areas identified for next quarter.', '[{"label":"Deliver core roadmap items","progress":83},{"label":"Improve documentation coverage","progress":84},{"label":"Mentorship & knowledge sharing","progress":82}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1012-H1', 'EMP-1012', 'H1 2026', 'EMP-1010', 4.5, 'Completed', '2026-06-20', 'Consistently exceeds expectations and mentors peers effectively.', '[{"label":"Deliver core roadmap items","progress":90},{"label":"Improve documentation coverage","progress":40},{"label":"Mentorship & knowledge sharing","progress":30}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1013-H1', 'EMP-1013', 'H1 2026', 'EMP-1010', 4.2, 'Completed', '2026-06-20', 'Strong contributor; delivered key projects on schedule.', '[{"label":"Deliver core roadmap items","progress":97},{"label":"Improve documentation coverage","progress":51},{"label":"Mentorship & knowledge sharing","progress":43}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1016-H1', 'EMP-1016', 'H1 2026', 'EMP-1030', 3.8, 'Upcoming', '2026-07-25', 'Solid performer with room to grow in cross-team collaboration.', '[{"label":"Deliver core roadmap items","progress":64},{"label":"Improve documentation coverage","progress":62},{"label":"Mentorship & knowledge sharing","progress":56}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1017-H1', 'EMP-1017', 'H1 2026', 'EMP-1016', 4.8, 'Completed', '2026-06-20', 'Outstanding impact this cycle; a role model for the team.', '[{"label":"Deliver core roadmap items","progress":71},{"label":"Improve documentation coverage","progress":73},{"label":"Mentorship & knowledge sharing","progress":69}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1018-H1', 'EMP-1018', 'H1 2026', 'EMP-1016', 3.5, 'Completed', '2026-06-20', 'Meeting expectations; focus areas identified for next quarter.', '[{"label":"Deliver core roadmap items","progress":78},{"label":"Improve documentation coverage","progress":84},{"label":"Mentorship & knowledge sharing","progress":82}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1019-H1', 'EMP-1019', 'H1 2026', 'EMP-1016', 4, 'Completed', '2026-06-20', 'Consistently exceeds expectations and mentors peers effectively.', '[{"label":"Deliver core roadmap items","progress":85},{"label":"Improve documentation coverage","progress":40},{"label":"Mentorship & knowledge sharing","progress":30}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1022-H1', 'EMP-1022', 'H1 2026', 'EMP-1030', 4.6, 'Upcoming', '2026-07-25', 'Strong contributor; delivered key projects on schedule.', '[{"label":"Deliver core roadmap items","progress":92},{"label":"Improve documentation coverage","progress":51},{"label":"Mentorship & knowledge sharing","progress":43}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1023-H1', 'EMP-1023', 'H1 2026', 'EMP-1022', 3.9, 'Completed', '2026-06-20', 'Solid performer with room to grow in cross-team collaboration.', '[{"label":"Deliver core roadmap items","progress":99},{"label":"Improve documentation coverage","progress":62},{"label":"Mentorship & knowledge sharing","progress":56}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1024-H1', 'EMP-1024', 'H1 2026', 'EMP-1022', 4.3, 'In Progress', '2026-06-20', 'Outstanding impact this cycle; a role model for the team.', '[{"label":"Deliver core roadmap items","progress":66},{"label":"Improve documentation coverage","progress":73},{"label":"Mentorship & knowledge sharing","progress":69}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1025-H1', 'EMP-1025', 'H1 2026', 'EMP-1022', 5, 'Completed', '2026-06-20', 'Meeting expectations; focus areas identified for next quarter.', '[{"label":"Deliver core roadmap items","progress":73},{"label":"Improve documentation coverage","progress":84},{"label":"Mentorship & knowledge sharing","progress":82}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1030-H1', 'EMP-1030', 'H1 2026', 'EMP-1030', 4.5, 'Upcoming', '2026-07-25', 'Consistently exceeds expectations and mentors peers effectively.', '[{"label":"Deliver core roadmap items","progress":80},{"label":"Improve documentation coverage","progress":40},{"label":"Mentorship & knowledge sharing","progress":30}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1031-H1', 'EMP-1031', 'H1 2026', 'EMP-1030', 4.2, 'Completed', '2026-06-20', 'Strong contributor; delivered key projects on schedule.', '[{"label":"Deliver core roadmap items","progress":87},{"label":"Improve documentation coverage","progress":51},{"label":"Mentorship & knowledge sharing","progress":43}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1032-H1', 'EMP-1032', 'H1 2026', 'EMP-1030', 3.8, 'Completed', '2026-06-20', 'Solid performer with room to grow in cross-team collaboration.', '[{"label":"Deliver core roadmap items","progress":94},{"label":"Improve documentation coverage","progress":62},{"label":"Mentorship & knowledge sharing","progress":56}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1034-H1', 'EMP-1034', 'H1 2026', 'EMP-1030', 4.8, 'Completed', '2026-06-20', 'Outstanding impact this cycle; a role model for the team.', '[{"label":"Deliver core roadmap items","progress":61},{"label":"Improve documentation coverage","progress":73},{"label":"Mentorship & knowledge sharing","progress":69}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1035-H1', 'EMP-1035', 'H1 2026', 'EMP-1034', 3.5, 'Upcoming', '2026-07-25', 'Meeting expectations; focus areas identified for next quarter.', '[{"label":"Deliver core roadmap items","progress":68},{"label":"Improve documentation coverage","progress":84},{"label":"Mentorship & knowledge sharing","progress":82}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1036-H1', 'EMP-1036', 'H1 2026', 'EMP-1034', 4, 'Completed', '2026-06-20', 'Consistently exceeds expectations and mentors peers effectively.', '[{"label":"Deliver core roadmap items","progress":75},{"label":"Improve documentation coverage","progress":40},{"label":"Mentorship & knowledge sharing","progress":30}]'::jsonb);
INSERT INTO performance_reviews (id, employee_id, cycle, reviewer_id, rating, status, date, summary, goals) VALUES ('REV-EMP-1037-H1', 'EMP-1037', 'H1 2026', 'EMP-1034', 4.6, 'Completed', '2026-06-20', 'Strong contributor; delivered key projects on schedule.', '[{"label":"Deliver core roadmap items","progress":82},{"label":"Improve documentation coverage","progress":51},{"label":"Mentorship & knowledge sharing","progress":43}]'::jsonb);

-- Seeding Onboarding Tasks
INSERT INTO onboarding_tasks (id, employee_id, label, done) VALUES ('ONB-1', 'EMP-1007', 'Sign employment contract', true);
INSERT INTO onboarding_tasks (id, employee_id, label, done) VALUES ('ONB-2', 'EMP-1007', 'Set up company email & SSO', true);
INSERT INTO onboarding_tasks (id, employee_id, label, done) VALUES ('ONB-3', 'EMP-1007', 'Provision laptop & equipment', true);
INSERT INTO onboarding_tasks (id, employee_id, label, done) VALUES ('ONB-4', 'EMP-1007', 'Complete HR onboarding forms', false);
INSERT INTO onboarding_tasks (id, employee_id, label, done) VALUES ('ONB-5', 'EMP-1007', 'Meet the team & manager 1:1', false);
INSERT INTO onboarding_tasks (id, employee_id, label, done) VALUES ('ONB-6', 'EMP-1037', 'Sign employment contract', true);
INSERT INTO onboarding_tasks (id, employee_id, label, done) VALUES ('ONB-7', 'EMP-1037', 'Set up company email & SSO', true);
INSERT INTO onboarding_tasks (id, employee_id, label, done) VALUES ('ONB-8', 'EMP-1037', 'Provision laptop & equipment', false);
INSERT INTO onboarding_tasks (id, employee_id, label, done) VALUES ('ONB-9', 'EMP-1037', 'Complete HR onboarding forms', false);
INSERT INTO onboarding_tasks (id, employee_id, label, done) VALUES ('ONB-10', 'EMP-1037', 'Security & compliance training', false);

-- Seeding Activity Feed
INSERT INTO activity_feed (id, type, message, timestamp) VALUES ('ACT-1', 'hire', 'Oscar Lindqvist accepted an offer for Enterprise AE', '2026-07-14T09:12:00');
INSERT INTO activity_feed (id, type, message, timestamp) VALUES ('ACT-2', 'leave', 'David Nguyen approved Noah Kim’s annual leave', '2026-07-14T08:40:00');
INSERT INTO activity_feed (id, type, message, timestamp) VALUES ('ACT-3', 'payroll', 'June payroll run completed — 28 of 30 paid', '2026-07-13T17:05:00');
INSERT INTO activity_feed (id, type, message, timestamp) VALUES ('ACT-4', 'review', 'Nadia Karim submitted H1 review for Marcus Reyes', '2026-07-13T14:22:00');
INSERT INTO activity_feed (id, type, message, timestamp) VALUES ('ACT-5', 'attendance', 'Elena Volkova clocked in late (09:24)', '2026-07-13T09:24:00');
INSERT INTO activity_feed (id, type, message, timestamp) VALUES ('ACT-6', 'hire', 'New position opened: Data Engineer (Engineering)', '2026-07-12T11:00:00');
INSERT INTO activity_feed (id, type, message, timestamp) VALUES ('ACT-7', 'leave', 'Priya Nair requested 5 days annual leave', '2026-07-11T16:48:00');

-- Disable Row Level Security (RLS) on all tables to allow simple frontend read/writes
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed DISABLE ROW LEVEL SECURITY;

-- Set admin flags for seeded administrators
UPDATE employees SET is_admin = TRUE WHERE id IN ('EMP-1001', 'EMP-1030');

