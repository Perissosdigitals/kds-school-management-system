--
-- PostgreSQL database dump
--

\restrict 6Mj5puNWImbD8gtm2zeZ9Gn7LBa9IeZPa4pYvT5GWmqud3DC7bIuoDKgVhBqF77

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

-- -- SET statement_timeout = 0;
-- -- SET lock_timeout = 0;
-- -- SET idle_in_transaction_session_timeout = 0;
-- -- SET client_encoding = 'UTF8';
-- -- SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
-- -- SET check_function_bodies = false;
-- -- SET xmloption = content;
-- -- SET client_min_messages = warning;
-- -- SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

-- -- CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

-- -- CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: students_gender_enum; Type: TYPE; Schema: public; Owner: kds_admin
--

CREATE TYPE public.students_gender_enum AS ENUM (
    'Masculin',
    'Féminin'
);


ALTER TYPE public.students_gender_enum OWNER TO kds_admin;

--
-- Name: students_status_enum; Type: TYPE; Schema: public; Owner: kds_admin
--

CREATE TYPE public.students_status_enum AS ENUM (
    'Actif',
    'Inactif',
    'En attente'
);


ALTER TYPE public.students_status_enum OWNER TO kds_admin;

--
-- Name: teachers_status_enum; Type: TYPE; Schema: public; Owner: kds_admin
--

CREATE TYPE public.teachers_status_enum AS ENUM (
    'Actif',
    'Inactif'
);


ALTER TYPE public.teachers_status_enum OWNER TO kds_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: kds_admin
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO kds_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.attendance (
    id uuid DEFAULT lower(hex(randomblob(16))) NOT NULL,
    student_id uuid NOT NULL,
    date date NOT NULL,
    status character varying(20) NOT NULL,
    reason text,
    recorded_by uuid NOT NULL,
    class_id uuid NOT NULL,
    timetable_slot_id uuid,
    arrival_time character varying(5),
    is_justified INTEGER DEFAULT false NOT NULL,
    justification_document character varying(500),
    comments text,
    updated_at TEXT DEFAULT now() NOT NULL,
    created_at TEXT DEFAULT now() NOT NULL
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT lower(hex(randomblob(16))) NOT NULL,
    action character varying(50) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid,
    user_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at TEXT DEFAULT now()
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: classes; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.classes (
    id uuid DEFAULT public.lower(hex(randomblob(16))) NOT NULL,
    name character varying(50) NOT NULL,
    level character varying(50) NOT NULL,
    academic_year character varying(20) NOT NULL,
    main_teacher_id uuid,
    room_number character varying(50),
    capacity integer DEFAULT 30 NOT NULL,
    is_active INTEGER DEFAULT true NOT NULL,
    created_at TEXT DEFAULT now() NOT NULL,
    updated_at TEXT DEFAULT now() NOT NULL
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.documents (
    id uuid DEFAULT public.lower(hex(randomblob(16))) NOT NULL,
    title character varying(200) NOT NULL,
    type character varying(50) NOT NULL,
    "entityType" character varying(20) NOT NULL,
    "studentId" uuid,
    "teacherId" uuid,
    "entityId" uuid,
    "filePath" character varying(500) NOT NULL,
    "fileName" character varying(100) NOT NULL,
    "mimeType" character varying(50) NOT NULL,
    "fileSize" bigint NOT NULL,
    "accessLevel" character varying(20) NOT NULL,
    description text,
    "expiryDate" date,
    "isActive" INTEGER DEFAULT true NOT NULL,
    "uploadedBy" uuid NOT NULL,
    "downloadCount" integer DEFAULT 0 NOT NULL,
    "createdAt" TEXT DEFAULT now() NOT NULL,
    "updatedAt" TEXT DEFAULT now() NOT NULL,
    student_id uuid,
    teacher_id uuid
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: financial_transactions; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.financial_transactions (
    id uuid DEFAULT lower(hex(randomblob(16))) NOT NULL,
    student_id uuid,
    type character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'EUR'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    due_date date,
    paid_date date,
    description text,
    reference character varying(100),
    created_by uuid,
    created_at TEXT DEFAULT now(),
    updated_at TEXT DEFAULT now(),
    CONSTRAINT financial_transactions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'overdue'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT financial_transactions_type_check CHECK (((type)::text = ANY ((ARRAY['tuition'::character varying, 'meal'::character varying, 'transport'::character varying, 'activity'::character varying, 'other'::character varying])::text[])))
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: grade_categories; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.grade_categories (
    id uuid DEFAULT lower(hex(randomblob(16))) NOT NULL,
    name character varying(100) NOT NULL,
    weight numeric(3,2) NOT NULL,
    subject_id uuid,
    class_id uuid,
    created_by uuid,
    created_at TEXT DEFAULT now(),
    CONSTRAINT grade_categories_weight_check CHECK (((weight >= (0)::numeric) AND (weight <= (1)::numeric)))
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: grades; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.grades (
    id uuid DEFAULT lower(hex(randomblob(16))) NOT NULL,
    student_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    evaluation_date date NOT NULL,
    teacher_id uuid NOT NULL,
    evaluation_type character varying(30) NOT NULL,
    value numeric(4,2) NOT NULL,
    max_value numeric(4,2) DEFAULT '20'::numeric NOT NULL,
    trimester character varying(30) NOT NULL,
    academic_year character varying(20) NOT NULL,
    title character varying(200),
    coefficient numeric(3,1) DEFAULT '1'::numeric,
    comments text,
    visible_to_parents INTEGER DEFAULT true NOT NULL,
    created_at TEXT DEFAULT now() NOT NULL,
    updated_at TEXT DEFAULT now() NOT NULL
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: import_batches; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.import_batches (
    id uuid DEFAULT lower(hex(randomblob(16))) NOT NULL,
    type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    total_rows integer DEFAULT 0,
    processed_rows integer DEFAULT 0,
    success_rows integer DEFAULT 0,
    error_rows integer DEFAULT 0,
    column_mapping jsonb,
    validation_rules jsonb,
    created_by uuid NOT NULL,
    approved_by uuid,
    reviewed_by uuid,
    created_at TEXT DEFAULT now(),
    approved_at TEXT,
    started_at TEXT,
    completed_at TEXT,
    error_log text,
    summary jsonb,
    CONSTRAINT import_batches_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'approved'::character varying, 'rejected'::character varying, 'completed'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT import_batches_type_check CHECK (((type)::text = ANY ((ARRAY['students'::character varying, 'teachers'::character varying, 'grades'::character varying, 'attendance'::character varying, 'subjects'::character varying, 'classes'::character varying])::text[])))
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: inventory; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.inventory (
    id uuid DEFAULT public.lower(hex(randomblob(16))) NOT NULL,
    name character varying NOT NULL,
    category character varying NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    unit character varying,
    location character varying,
    status character varying DEFAULT 'available'::character varying NOT NULL,
    purchase_date date,
    purchase_price numeric(10,2),
    condition character varying,
    notes text,
    created_by character varying,
    created_at TEXT DEFAULT now() NOT NULL,
    updated_at TEXT DEFAULT now() NOT NULL
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: school_events; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.school_events (
    id uuid DEFAULT public.lower(hex(randomblob(16))) NOT NULL,
    title character varying NOT NULL,
    description text,
    event_type character varying NOT NULL,
    start_date date NOT NULL,
    end_date date,
    location character varying,
    participants text,
    status character varying DEFAULT 'scheduled'::character varying NOT NULL,
    created_by character varying,
    created_at TEXT DEFAULT now() NOT NULL,
    updated_at TEXT DEFAULT now() NOT NULL
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: student_documents; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.student_documents (
    id uuid DEFAULT lower(hex(randomblob(16))) NOT NULL,
    student_id uuid,
    type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    file_url text,
    file_name character varying(255),
    file_size integer,
    uploaded_by uuid,
    validated_by uuid,
    uploaded_at TEXT DEFAULT now(),
    validated_at TEXT,
    rejection_reason text,
    change_history jsonb DEFAULT '[]'::jsonb,
    created_at TEXT DEFAULT now(),
    updated_at TEXT DEFAULT now(),
    CONSTRAINT student_documents_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'validated'::character varying, 'rejected'::character varying, 'missing'::character varying])::text[]))),
    CONSTRAINT student_documents_type_check CHECK (((type)::text = ANY ((ARRAY['birth_certificate'::character varying, 'id_card'::character varying, 'health_record'::character varying, 'academic_transcript'::character varying, 'parental_authorization'::character varying, 'vaccination_record'::character varying, 'other'::character varying])::text[])))
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: students; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.students (
    id uuid DEFAULT public.lower(hex(randomblob(16))) NOT NULL,
    registration_number character varying(20) NOT NULL,
    registration_date date NOT NULL,
    last_name character varying(100) NOT NULL,
    first_name character varying(100) NOT NULL,
    dob date NOT NULL,
    gender public.students_gender_enum NOT NULL,
    nationality character varying(100) NOT NULL,
    birth_place character varying(200) NOT NULL,
    address text NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(150),
    grade_level character varying(50) NOT NULL,
    previous_school character varying(200),
    emergency_contact_name character varying(150) NOT NULL,
    emergency_contact_phone character varying(20) NOT NULL,
    medical_info text,
    status public.students_status_enum DEFAULT 'En attente'::public.students_status_enum NOT NULL,
    documents jsonb DEFAULT '[]'::jsonb NOT NULL,
    user_id uuid,
    class_id uuid,
    created_at TEXT DEFAULT now() NOT NULL,
    updated_at TEXT DEFAULT now() NOT NULL
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: subjects; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.subjects (
    id uuid DEFAULT public.lower(hex(randomblob(16))) NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    description text,
    grade_level character varying(50) NOT NULL,
    weekly_hours integer NOT NULL,
    coefficient numeric(3,1) DEFAULT '1'::numeric NOT NULL,
    color character varying(7),
    is_active INTEGER DEFAULT true NOT NULL,
    created_at TEXT DEFAULT now() NOT NULL,
    updated_at TEXT DEFAULT now() NOT NULL
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: teachers; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.teachers (
    id uuid DEFAULT public.lower(hex(randomblob(16))) NOT NULL,
    last_name character varying(100) NOT NULL,
    first_name character varying(100) NOT NULL,
    subject character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(150) NOT NULL,
    status public.teachers_status_enum DEFAULT 'Actif'::public.teachers_status_enum NOT NULL,
    user_id uuid,
    created_at TEXT DEFAULT now() NOT NULL,
    updated_at TEXT DEFAULT now() NOT NULL
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: timetable_slots; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.timetable_slots (
    id uuid DEFAULT lower(hex(randomblob(16))) NOT NULL,
    class_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    room character varying(50),
    is_active INTEGER DEFAULT true NOT NULL,
    academic_year character varying(20) NOT NULL,
    day_of_week character varying(20) NOT NULL,
    start_time character varying(5) NOT NULL,
    end_time character varying(5) NOT NULL,
    created_at TEXT DEFAULT now() NOT NULL,
    updated_at TEXT DEFAULT now() NOT NULL
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.transactions (
    id uuid DEFAULT public.lower(hex(randomblob(16))) NOT NULL,
    type character varying(20) NOT NULL,
    category character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    "transactionDate" date NOT NULL,
    "dueDate" date,
    status character varying(20) NOT NULL,
    "studentId" uuid,
    description character varying(200) NOT NULL,
    "paymentMethod" character varying(50),
    "referenceNumber" character varying(100),
    "amountPaid" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "amountRemaining" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    notes text,
    "recordedBy" uuid,
    "createdAt" TEXT DEFAULT now() NOT NULL,
    "updatedAt" TEXT DEFAULT now() NOT NULL,
    student_id uuid
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: kds_admin
--

CREATE TABLE public.users (
    id uuid DEFAULT lower(hex(randomblob(16))) NOT NULL,
    is_active INTEGER DEFAULT true NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    role character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    phone character varying,
    avatar_url character varying,
    created_at TEXT DEFAULT now() NOT NULL,
    updated_at TEXT DEFAULT now() NOT NULL,
    last_login_at TEXT
);


-- -- ALTER TABLE OWNER TO kds_admin;

--
-- Name: subjects PK_1a023685ac2b051b4e557b0b280; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.subjects
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: students PK_7d7f07271ad4ce999880713f05e; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.students
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: school_events PK_80ec05bba53783971a4454f1732; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.school_events
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: inventory PK_82aa5da437c5bbfb80703b08309; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.inventory
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: transactions PK_a219afd8dd77ed80f5a862f1db9; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.transactions
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: teachers PK_a8d4f83be3abe4c687b0a0093c8; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.teachers
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: documents PK_ac51aa5181ee2036f5ca482857c; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.documents
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: classes PK_e207aa15404e9b2ce35910f9f7f; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.classes
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: subjects UQ_542cbba74dde3c82ab49c573109; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.subjects
    -- -- ADD CONSTRAINT UNIQUE (code);


--
-- Name: students UQ_82946fdb5652b83cacb81e9083e; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.students
    -- -- ADD CONSTRAINT UNIQUE (registration_number);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.users
    -- -- ADD CONSTRAINT UNIQUE (email);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.attendance
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.audit_logs
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: financial_transactions financial_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.financial_transactions
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: grade_categories grade_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.grade_categories
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.grades
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: import_batches import_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.import_batches
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: student_documents student_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.student_documents
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: timetable_slots timetable_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.timetable_slots
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.users
    -- -- ADD CONSTRAINT PRIMARY KEY (id);


--
-- Name: idx_audit_action; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_audit_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_date; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_audit_date ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_entity; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_audit_entity ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_audit_user; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_audit_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_documents_status; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_documents_status ON public.student_documents USING btree (status);


--
-- Name: idx_documents_student; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_documents_student ON public.student_documents USING btree (student_id);


--
-- Name: idx_documents_type; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_documents_type ON public.student_documents USING btree (type);


--
-- Name: idx_grade_categories_class; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_grade_categories_class ON public.grade_categories USING btree (class_id);


--
-- Name: idx_grade_categories_subject; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_grade_categories_subject ON public.grade_categories USING btree (subject_id);


--
-- Name: idx_import_created; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_import_created ON public.import_batches USING btree (created_at);


--
-- Name: idx_import_created_by; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_import_created_by ON public.import_batches USING btree (created_by);


--
-- Name: idx_import_status; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_import_status ON public.import_batches USING btree (status);


--
-- Name: idx_import_type; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_import_type ON public.import_batches USING btree (type);


--
-- Name: idx_transactions_due; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_transactions_due ON public.financial_transactions USING btree (due_date);


--
-- Name: idx_transactions_status; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_transactions_status ON public.financial_transactions USING btree (status);


--
-- Name: idx_transactions_student; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_transactions_student ON public.financial_transactions USING btree (student_id);


--
-- Name: idx_transactions_type; Type: INDEX; Schema: public; Owner: kds_admin
--

-- -- CREATE INDEX idx_transactions_type ON public.financial_transactions USING btree (type);


--
-- Name: student_documents update_documents_updated_at; Type: TRIGGER; Schema: public; Owner: kds_admin
--

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.student_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: grades update_grades_updated_at; Type: TRIGGER; Schema: public; Owner: kds_admin
--

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: timetable_slots update_timetable_updated_at; Type: TRIGGER; Schema: public; Owner: kds_admin
--

CREATE TRIGGER update_timetable_updated_at BEFORE UPDATE ON public.timetable_slots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: financial_transactions update_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: kds_admin
--

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: kds_admin
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: attendance FK_454ea5e3a649d87f921a6571aff; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.attendance
    -- -- ADD CONSTRAINT FOREIGN KEY (timetable_slot_id) REFERENCES public.timetable_slots(id);


--
-- Name: teachers FK_4668d4752e6766682d1be0b346f; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.teachers
    -- -- ADD CONSTRAINT FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: grades FK_4e40960913bb4a4c059fa9939d6; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.grades
    -- -- ADD CONSTRAINT FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- Name: attendance FK_6200532f3ef99f639a27bdcae7f; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.attendance
    -- -- ADD CONSTRAINT FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: grades FK_9acca493883cee3b9e8f9e01cd1; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.grades
    -- -- ADD CONSTRAINT FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: classes FK_9d6748ccb6adb28d4b2b523f26e; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.classes
    -- -- ADD CONSTRAINT FOREIGN KEY (main_teacher_id) REFERENCES public.teachers(id);


--
-- Name: transactions FK_ace9f0f6d6f6a6375eee9be1625; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.transactions
    -- -- ADD CONSTRAINT FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: documents FK_add06d9cca9b67e7392a060b6c7; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.documents
    -- -- ADD CONSTRAINT FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: grades FK_ae1618ce22f07ef3e5e51d4c9e8; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.grades
    -- -- ADD CONSTRAINT FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: timetable_slots FK_b55795af4ec086b54c854193c6b; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.timetable_slots
    -- -- ADD CONSTRAINT FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- Name: documents FK_bd504a1a8d7a53ca8d972c09137; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.documents
    -- -- ADD CONSTRAINT FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- Name: timetable_slots FK_c7b9db0505fd3ed9ad612f073e8; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.timetable_slots
    -- -- ADD CONSTRAINT FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: timetable_slots FK_da4356c886fae446a536a69f1b5; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.timetable_slots
    -- -- ADD CONSTRAINT FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: students FK_de6ad4ae6936dce474e2823984e; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.students
    -- -- ADD CONSTRAINT FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: attendance FK_e63ac3a881f4b1ff420942c217a; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.attendance
    -- -- ADD CONSTRAINT FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: students FK_fb3eff90b11bddf7285f9b4e281; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.students
    -- -- ADD CONSTRAINT FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.audit_logs
    -- -- ADD CONSTRAINT FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.financial_transactions
    -- -- ADD CONSTRAINT FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: grade_categories grade_categories_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.grade_categories
    -- -- ADD CONSTRAINT FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: import_batches import_batches_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.import_batches
    -- -- ADD CONSTRAINT FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: import_batches import_batches_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.import_batches
    -- -- ADD CONSTRAINT FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: import_batches import_batches_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.import_batches
    -- -- ADD CONSTRAINT FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: student_documents student_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.student_documents
    -- -- ADD CONSTRAINT FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: student_documents student_documents_validated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kds_admin
--

-- -- ALTER TABLE ONLY public.student_documents
    -- -- ADD CONSTRAINT FOREIGN KEY (validated_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 6Mj5puNWImbD8gtm2zeZ9Gn7LBa9IeZPa4pYvT5GWmqud3DC7bIuoDKgVhBqF77

