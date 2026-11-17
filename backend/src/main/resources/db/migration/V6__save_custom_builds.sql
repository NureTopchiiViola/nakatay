CREATE TABLE saved_custom_build (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_name VARCHAR(255) NOT NULL,
    configuration_data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_saved_custom_build_user_created
    ON saved_custom_build(user_id, created_at DESC);
