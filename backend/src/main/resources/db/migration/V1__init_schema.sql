CREATE TABLE IF NOT EXISTS car_model (
                                         model_id BIGSERIAL PRIMARY KEY,
                                         brand VARCHAR(50) NOT NULL,
                                         model_name VARCHAR(100) NOT NULL,
                                         base_price DECIMAL(12, 2) NOT NULL,
                                         body_type VARCHAR(50) NOT NULL,
                                         description TEXT,
                                         main_image_url VARCHAR(255),

                                         is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS car_trim (
                                        trim_id BIGSERIAL PRIMARY KEY,
                                        model_id BIGINT NOT NULL REFERENCES car_model(model_id),
                                        trim_name VARCHAR(100) NOT NULL,
                                        year INT NOT NULL,
                                        engine VARCHAR(100) NOT NULL,
                                        transmission VARCHAR(50) NOT NULL,
                                        price_modifier DECIMAL(12, 2) DEFAULT 0.0,

                                        is_available BOOLEAN DEFAULT TRUE
);

-- indexes for car_model
CREATE INDEX idx_car_model_brand_name ON car_model(brand, model_name);
CREATE INDEX idx_car_model_price ON car_model(base_price);
CREATE INDEX idx_car_model_created_at ON car_model(created_at);
CREATE INDEX idx_car_model_body_type ON car_model(body_type);

-- indexes for car_trim
CREATE INDEX idx_car_trim_model_id ON car_trim(model_id);
CREATE INDEX idx_car_trim_year ON car_trim(year);
CREATE INDEX idx_car_trim_transmission ON car_trim(transmission);

INSERT INTO car_model (brand, model_name, base_price, body_type, description, main_image_url)
VALUES
    ('BMW', 'M4', 85000.00, 'COUPE', 'Безкомпромісний спортивний автомобіль із видатною динамікою та агресивним дизайном.', 'https://example.com/images/bmw-m4.jpg'),
    ('Audi', 'RS6 Avant', 120000.00, 'WAGON', 'Ідеальний баланс між сімейним універсалом та спорткаром.', 'https://example.com/images/audi-rs6.jpg'),
    ('Porsche', '911', 115000.00, 'COUPE', 'Класика німецької інженерії. Легендарний силует і неперевершена керованість.', 'https://example.com/images/porsche-911.jpg'),
    ('Toyota', 'Camry', 32000.00, 'SEDAN', 'Надійний, комфортний та економічний седан для щоденних поїздок.', 'https://example.com/images/toyota-camry.jpg');

INSERT INTO car_trim (model_id, trim_name, year, engine, transmission, price_modifier)
VALUES
    (1, 'Competition', 2023, '3.0L Twin-Turbo I6', 'AUTOMATIC', 0.00),
    (2, 'Base', 2024, '4.0L Twin-Turbo V8', 'AUTOMATIC', 0.00),
    (3, 'Carrera', 2023, '3.0L Flat-6', 'PDK (AUTOMATIC)', 0.00),
    (4, 'Hybrid', 2024, '2.5L Hybrid', 'CVT (AUTOMATIC)', 0.00);