ALTER TABLE car_trim ADD COLUMN visualizer_key VARCHAR(50) UNIQUE;

ALTER TABLE configuration_option
    ADD COLUMN option_group VARCHAR(50),
    ADD COLUMN visual_code VARCHAR(50),
    ADD COLUMN is_factory_default BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN required_visual_code VARCHAR(50);

UPDATE configuration_option
SET option_group = CASE sub_category
    WHEN 'Колір кузова' THEN 'paint'
    WHEN 'Диски' THEN 'wheels'
    WHEN 'Матеріал та колір оздоблення салону' THEN 'interior'
    WHEN 'Декоративні вставки' THEN 'decor'
    WHEN 'Пакети дооснащення' THEN 'package'
    ELSE 'extra'
END;

UPDATE configuration_option SET is_factory_default = TRUE
WHERE option_group <> 'extra' AND price_modifier = 0 AND is_available;

WITH model AS (
    INSERT INTO car_model (brand, model_name, base_price, body_type)
    VALUES ('BMW', 'E46 328i', 1850000, 'SEDAN')
    RETURNING model_id
), trim AS (
    INSERT INTO car_trim (model_id, trim_name, year, engine, transmission, visualizer_key)
    SELECT model_id, 'Sport', 1999, '2.8L I6', 'MANUAL', 'bmw-e46' FROM model
    RETURNING trim_id
)
INSERT INTO configuration_option (car_trim_id, category, sub_category, option_group,
    visual_code, name, price_modifier, is_factory_default, is_available, required_visual_code)
SELECT trim.trim_id, value.category, value.label, value.option_group, value.visual_code, value.name,
    value.price, value.factory, value.available, value.requires
FROM trim CROSS JOIN (VALUES
    ('EXTERIOR', 'Колір кузова', 'paint', 'graphite', 'Graphite Metallic', 0, FALSE, TRUE, NULL),
    ('EXTERIOR', 'Колір кузова', 'paint', 'titanium', 'Titanium Silver', 0, FALSE, TRUE, NULL),
    ('EXTERIOR', 'Колір кузова', 'paint', 'sapphire', 'Sapphire Blue', 0, FALSE, TRUE, NULL),
    ('EXTERIOR', 'Колір кузова', 'paint', 'crimson', 'Crimson Red', 0, TRUE, TRUE, NULL),
    ('EXTERIOR', 'Колір кузова', 'paint', 'obsidian', 'Obsidian Black', 0, FALSE, TRUE, NULL),
    ('EXTERIOR', 'Колісні диски', 'wheels', 'alloy', '19″ Sport Alloy', 0, TRUE, TRUE, NULL),
    ('EXTERIOR', 'Колісні диски', 'wheels', 'forged', '20″ Forged Performance', 48000, FALSE, TRUE, NULL),
    ('EXTERIOR', 'Колісні диски', 'wheels', 'carbon', '21″ Carbon Aeromesh', 85000, FALSE, TRUE, NULL),
    ('INTERIOR', 'Оббивка салону', 'interior', 'black', 'Шкіра Nappa Black', 0, TRUE, TRUE, NULL),
    ('INTERIOR', 'Оббивка салону', 'interior', 'cognac', 'Коньячна перфорована шкіра', 38000, FALSE, TRUE, NULL),
    ('INTERIOR', 'Оббивка салону', 'interior', 'ivory', 'Світла шкіра Ivory White', 52000, FALSE, TRUE, NULL),
    ('INTERIOR', 'Декоративні вставки', 'decor', 'carbon', 'Матовий карбон', 0, TRUE, TRUE, NULL),
    ('INTERIOR', 'Декоративні вставки', 'decor', 'wood', 'Натуральне дерево', 18000, FALSE, TRUE, NULL),
    ('PACKAGES', 'Пакет оснащення', 'package', 'standard', 'Standard', 0, TRUE, TRUE, NULL),
    ('PACKAGES', 'Пакет оснащення', 'package', 'comfort', 'Comfort & Tech', 95000, FALSE, TRUE, NULL),
    ('PACKAGES', 'Пакет оснащення', 'package', 'sport', 'Sport Track Pro', 145000, FALSE, TRUE, NULL),
    ('EXTERIOR', 'Аеродинаміка та екстер’єр', 'extra', 'spoiler', 'Карбоновий спойлер GT', 32000, FALSE, TRUE, 'sport'),
    ('EXTERIOR', 'Аеродинаміка та екстер’єр', 'extra', 'matrix', 'Матричні LED-фари', 54000, FALSE, TRUE, NULL),
    ('OPTIONS', 'Додаткове обладнання', 'extra', 'roof', 'Панорамний скляний дах', 45000, FALSE, FALSE, NULL),
    ('OPTIONS', 'Додаткове обладнання', 'extra', 'night', 'Система нічного бачення (Night Vision)', 62000, FALSE, TRUE, NULL),
    ('OPTIONS', 'Додаткове обладнання', 'extra', 'recorder', 'Вбудований 4K відеореєстратор', 15000, FALSE, TRUE, NULL)
) AS value(category, label, option_group, visual_code, name, price, factory, available, requires);
