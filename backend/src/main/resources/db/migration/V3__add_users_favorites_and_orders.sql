CREATE TABLE IF NOT EXISTS users (
                                     id BIGSERIAL PRIMARY KEY,
                                     email VARCHAR(255) NOT NULL UNIQUE,
                                     google_id VARCHAR(255) UNIQUE,
                                     first_name VARCHAR(100),
                                     last_name VARCHAR(100),
                                     phone_number VARCHAR(30),
                                     role VARCHAR(50) NOT NULL DEFAULT 'CLIENT',
                                     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

ALTER TABLE saved_configuration
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE saved_configuration
    ADD CONSTRAINT fk_saved_config_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_saved_config_user_id ON saved_configuration(user_id);


CREATE TABLE IF NOT EXISTS favorite_cars (
                                             id BIGSERIAL PRIMARY KEY,
                                             user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                             car_model_id BIGINT NOT NULL REFERENCES car_model(model_id) ON DELETE CASCADE,
                                             added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                             CONSTRAINT uq_user_favorite_car UNIQUE (user_id, car_model_id)
);

CREATE INDEX IF NOT EXISTS idx_favorite_cars_user_id ON favorite_cars(user_id);

CREATE TABLE IF NOT EXISTS orders (
                                      id BIGSERIAL PRIMARY KEY,
                                      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                      car_trim_id BIGINT NOT NULL REFERENCES car_trim(trim_id) ON DELETE CASCADE,
                                      saved_configuration_id BIGINT REFERENCES saved_configuration(id) ON DELETE SET NULL,
                                      configuration_data TEXT,
                                      total_price DECIMAL(12, 2) NOT NULL,
                                      status VARCHAR(50) NOT NULL DEFAULT 'NEW',
                                      contact_phone VARCHAR(30),
                                      contact_email VARCHAR(255),
                                      notes TEXT,
                                      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);