CREATE TABLE IF NOT EXISTS car (
                                   car_id BIGSERIAL PRIMARY KEY,
                                   brand VARCHAR(50) NOT NULL,
                                   model VARCHAR(100) NOT NULL,
                                   base_price DECIMAL(12, 2) NOT NULL,
                                   year INT NOT NULL,
                                   body_type VARCHAR(50) NOT NULL,
                                   engine VARCHAR(100) NOT NULL,
                                   transmission VARCHAR(50) NOT NULL,
                                   description TEXT,
                                   main_image_url VARCHAR(255),
                                   is_available BOOLEAN DEFAULT TRUE,

                                   is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
                                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
-- index for search
CREATE INDEX idx_car_brand_model ON car(brand, model);

--indexes for filters
CREATE INDEX idx_car_price ON car(base_price);
CREATE INDEX idx_car_year ON car(year);
CREATE INDEX idx_car_created_at ON car(created_at);

--inexes for filters with multiple columns
CREATE INDEX idx_car_body_transmission ON car(body_type, transmission);

INSERT INTO car (
    brand, model, base_price, year, body_type, engine, transmission, description, main_image_url
) VALUES
      (
          'BMW', 'M4 Competition', 85000.00, 2023, 'COUPE', '3.0L Twin-Turbo I6', 'AUTOMATIC',
          'Бескомпромиссный спортивный автомобиль с выдающейся динамикой и агрессивным дизайном.',
          'https://example.com/images/bmw-m4.jpg'
      ),
      (
          'Audi', 'RS6 Avant', 120000.00, 2024, 'WAGON', '4.0L Twin-Turbo V8', 'AUTOMATIC',
          'Идеальный баланс между семейным универсалом и суперкаром.',
          'https://example.com/images/audi-rs6.jpg'
      ),
      (
          'Porsche', '911 Carrera', 115000.00, 2023, 'COUPE', '3.0L Flat-6', 'PDK (AUTOMATIC)',
          'Классика немецкого инжиниринга. Легендарный силуэт и непревзойденная управляемость.',
          'https://example.com/images/porsche-911.jpg'
      ),
      (
          'Toyota', 'Camry', 32000.00, 2024, 'SEDAN', '2.5L Hybrid', 'CVT (AUTOMATIC)',
          'Надежный, комфортный и экономичный седан для ежедневных поездок.',
          'https://example.com/images/toyota-camry.jpg'
      );