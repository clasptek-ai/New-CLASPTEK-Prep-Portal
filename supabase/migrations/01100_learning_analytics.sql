-- Migration: 01100_learning_analytics.sql
-- Bounded Context: Learning Analytics & Instructor Intelligence

CREATE TABLE IF NOT EXISTS metric_definitions (
    id UUID PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    formula TEXT NOT NULL,
    owner VARCHAR(100) NOT NULL,
    refresh_frequency VARCHAR(50) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    target VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_jobs (
    id UUID PRIMARY KEY,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    initiated_by VARCHAR(100) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS snapshot_versions (
    id UUID PRIMARY KEY,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source_domains TEXT[] NOT NULL,
    schema_version VARCHAR(50) NOT NULL,
    aggregation_version VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS widget_definitions (
    id UUID PRIMARY KEY,
    widget_type VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    default_config JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS widget_instances (
    id UUID PRIMARY KEY,
    dashboard_id UUID NOT NULL,
    widget_definition_id UUID REFERENCES widget_definitions(id),
    title VARCHAR(255) NOT NULL,
    layout_grid JSONB NOT NULL,
    configuration JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_definitions (
    id UUID PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    template_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_executions (
    id UUID PRIMARY KEY,
    report_definition_id UUID REFERENCES report_definitions(id),
    status VARCHAR(50) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    result_url TEXT,
    error_log TEXT
);

CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY,
    report_definition_id UUID REFERENCES report_definitions(id),
    recipient_email VARCHAR(255) NOT NULL,
    cron_expression VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS export_jobs (
    id UUID PRIMARY KEY,
    format VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL,
    download_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    generated_by VARCHAR(100) NOT NULL,
    download_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_sources (
    id UUID PRIMARY KEY,
    source_domain VARCHAR(100) NOT NULL,
    metric_code VARCHAR(100) REFERENCES metric_definitions(code),
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_validations (
    id UUID PRIMARY KEY,
    run_date DATE NOT NULL,
    validation_type VARCHAR(100) NOT NULL,
    details JSONB NOT NULL,
    status VARCHAR(50) NOT NULL,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Materialized Dashboard Read Projections
CREATE TABLE IF NOT EXISTS student_analytics_dashboard_projections (
    student_id UUID NOT NULL,
    profile_id UUID NOT NULL,
    readiness_score DECIMAL(5,2),
    daily_plan JSONB,
    goal_completion DECIMAL(5,2),
    study_streak INTEGER,
    practice_performance JSONB,
    assessment_history JSONB,
    coach_summary JSONB,
    prediction_trend JSONB,
    weak_competencies JSONB,
    recommended_actions JSONB,
    last_computed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (student_id, profile_id)
);

CREATE TABLE IF NOT EXISTS instructor_dashboard_projections (
    cohort_id UUID PRIMARY KEY,
    overview JSONB NOT NULL,
    risk_matrix JSONB NOT NULL,
    heatmap JSONB NOT NULL,
    completion_rates JSONB NOT NULL,
    quality_summary JSONB NOT NULL,
    predictions_dist JSONB NOT NULL,
    interventions JSONB NOT NULL,
    coach_engagement JSONB NOT NULL,
    top_performers JSONB NOT NULL,
    attention_needed JSONB NOT NULL,
    last_computed_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_dashboard_projections (
    org_id UUID PRIMARY KEY,
    platform_usage JSONB NOT NULL,
    dau JSONB NOT NULL,
    enrollments JSONB NOT NULL,
    completion_stats JSONB NOT NULL,
    ai_usage JSONB NOT NULL,
    prediction_accuracy JSONB NOT NULL,
    infrastructure JSONB NOT NULL,
    revenue JSONB NOT NULL,
    growth_trends JSONB NOT NULL,
    retention JSONB NOT NULL,
    last_computed_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS competency_projections (
    competency_code VARCHAR(100) PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    mastery_distribution JSONB NOT NULL,
    average_score DECIMAL(5,2) NOT NULL,
    cohort_averages JSONB NOT NULL,
    last_computed_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS risk_projections (
    student_id UUID PRIMARY KEY,
    risk_level VARCHAR(50) NOT NULL,
    risk_score DECIMAL(5,2) NOT NULL,
    risk_factors JSONB NOT NULL,
    recommended_action TEXT NOT NULL,
    last_computed_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS cohort_analytics (
    cohort_id UUID PRIMARY KEY,
    average_readiness DECIMAL(5,2) NOT NULL,
    risk_distribution JSONB NOT NULL,
    average_study_minutes DECIMAL(6,2) NOT NULL,
    assessment_averages JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_trends (
    id UUID PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    trend_date DATE NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS prediction_trends (
    id UUID PRIMARY KEY,
    model_version VARCHAR(50) NOT NULL,
    measured_date DATE NOT NULL,
    accuracy_rate DECIMAL(5,2) NOT NULL,
    mae DECIMAL(5,2) NOT NULL,
    total_predictions INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS evaluation_trends (
    id UUID PRIMARY KEY,
    evaluator_id VARCHAR(100) NOT NULL,
    measured_date DATE NOT NULL,
    agreement_rate DECIMAL(5,2) NOT NULL,
    human_override_rate DECIMAL(5,2) NOT NULL,
    total_evals INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS coach_activity_metrics (
    coach_id UUID PRIMARY KEY,
    total_sessions INTEGER NOT NULL,
    total_messages INTEGER NOT NULL,
    average_response_tokens INTEGER NOT NULL,
    satisfaction_score DECIMAL(3,2),
    last_active_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS practice_metrics (
    cohort_id UUID PRIMARY KEY,
    total_practice_sessions INTEGER NOT NULL,
    average_score DECIMAL(5,2) NOT NULL,
    accuracy_rate DECIMAL(5,2) NOT NULL,
    time_spent_seconds BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS assessment_metrics (
    cohort_id UUID PRIMARY KEY,
    total_submissions INTEGER NOT NULL,
    average_score DECIMAL(5,2) NOT NULL,
    pass_rate DECIMAL(5,2) NOT NULL,
    completion_rate DECIMAL(5,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_metrics (
    metric_date DATE PRIMARY KEY,
    dau INTEGER NOT NULL,
    mau INTEGER NOT NULL,
    new_users INTEGER NOT NULL,
    active_connections INTEGER NOT NULL
);
