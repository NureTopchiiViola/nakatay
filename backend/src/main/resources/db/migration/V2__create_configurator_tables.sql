CREATE TABLE configuration_option (
                                      id BIGSERIAL PRIMARY KEY,
                                      car_trim_id BIGINT NOT NULL REFERENCES car_trim(id) ON DELETE CASCADE,
                                      category VARCHAR(50) NOT NULL,
                                      sub_category VARCHAR(100),
                                      name VARCHAR(255) NOT NULL,
                                      price_modifier DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
                                      asset_url VARCHAR(500),
                                      is_available BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE saved_configuration (
                                     id BIGSERIAL PRIMARY KEY,
                                     user_id BIGINT,
                                     car_trim_id BIGINT NOT NULL REFERENCES car_trim(id) ON DELETE CASCADE,
                                     share_code VARCHAR(32) NOT NULL UNIQUE,
                                     total_price DECIMAL(12, 2) NOT NULL,
                                     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE config_option_map (
                                   map_id BIGSERIAL PRIMARY KEY,
                                   config_id BIGINT NOT NULL REFERENCES saved_configuration(id) ON DELETE CASCADE,
                                   option_id BIGINT NOT NULL REFERENCES configuration_option(id) ON DELETE CASCADE,
                                   CONSTRAINT uq_config_option UNIQUE (config_id, option_id)
);

CREATE INDEX idx_config_option_trim ON configuration_option(car_trim_id);
CREATE INDEX idx_saved_config_share_code ON saved_configuration(share_code);

-- EXTERIOR
INSERT INTO configuration_option (car_trim_id, category, sub_category, name, price_modifier, asset_url, is_available)
VALUES
    (1, 'EXTERIOR', 'Колір кузова', 'Graphite Metallic', 0.00, 'https://example.com/assets/paints/graphite.png', true),
    (1, 'EXTERIOR', 'Колір кузова', 'Soul Red Crystal', 25000.00, 'https://example.com/assets/paints/red.png', true),
    (1, 'EXTERIOR', 'Колір кузова', 'Jet Black Pearl', 15000.00, 'https://example.com/assets/paints/black.png', true),

    (1, 'EXTERIOR', 'Диски', '18" Standard Alloy', 0.00, 'https://example.com/assets/wheels/18-standard.png', true),
    (1, 'EXTERIOR', 'Диски', '19" Sport Alloy', 42000.00, 'https://example.com/assets/wheels/19-sport.png', true);

-- INTERIOR
INSERT INTO configuration_option (car_trim_id, category, sub_category, name, price_modifier, asset_url, is_available)
VALUES
    (1, 'INTERIOR', 'Матеріал та колір оздоблення салону', 'Шкіра Nappa Black', 0.00, 'https://example.com/assets/interior/nappa-black.png', true),
    (1, 'INTERIOR', 'Матеріал та колір оздоблення салону', 'Коньячна перфорована шкіра', 38000.00, 'https://example.com/assets/interior/cognac.png', true),
    (1, 'INTERIOR', 'Матеріал та колір оздоблення салону', 'Світла шкіра Ivory White', 52000.00, 'https://example.com/assets/interior/ivory-white.png', true),

    (1, 'INTERIOR', 'Декоративні вставки', 'Матовий карбон', 0.00, 'https://example.com/assets/interior/carbon.png', true),
    (1, 'INTERIOR', 'Декоративні вставки', 'Натуральне дерево', 18000.00, 'https://example.com/assets/interior/wood.png', true);

-- PACKAGES
INSERT INTO configuration_option (car_trim_id, category, sub_category, name, price_modifier, asset_url, is_available)
VALUES
    (1, 'PACKAGES', 'Пакети дооснащення', 'Стандартний пакет', 0.00, NULL, true),
    (1, 'PACKAGES', 'Пакети дооснащення', 'Пакет "Sport Performance"', 65000.00, 'https://example.com/assets/packages/sport.png', true),
    (1, 'PACKAGES', 'Пакети дооснащення', 'Пакет "Premium Comfort & Sound"', 54000.00, 'https://example.com/assets/packages/comfort.png', true);

-- OPTIONS
INSERT INTO configuration_option (car_trim_id, category, sub_category, name, price_modifier, asset_url, is_available)
VALUES
    (1, 'OPTIONS', 'Акустика', 'Акустична система Bose Premium (9 динаміків)', 28000.00, NULL, true),
    (1, 'OPTIONS', 'Оптика', 'Адаптивні матричні LED-фари', 34000.00, NULL, true),
    (1, 'OPTIONS', 'Аеродинаміка', 'Задній спортивний спойлер', 16000.00, NULL, true);