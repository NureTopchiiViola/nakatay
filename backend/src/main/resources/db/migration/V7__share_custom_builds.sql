CREATE TABLE shared_custom_build (
    id BIGSERIAL PRIMARY KEY,
    share_code VARCHAR(20) NOT NULL UNIQUE,
    model_name VARCHAR(255) NOT NULL,
    configuration_data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
