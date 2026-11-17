ALTER TABLE orders
    ALTER COLUMN car_trim_id DROP NOT NULL,
    ADD COLUMN contact_name VARCHAR(255),
    ADD COLUMN payment_method VARCHAR(50),
    ADD COLUMN vehicle_name VARCHAR(255),
    ADD COLUMN vehicle_year INTEGER,
    ADD COLUMN image_url TEXT,
    ADD COLUMN color VARCHAR(100),
    ADD COLUMN selected_options TEXT NOT NULL DEFAULT '[]';

UPDATE orders o
SET vehicle_name = concat_ws(' ', m.brand, m.model_name, t.trim_name),
    vehicle_year = t.year,
    image_url = m.main_image_url
FROM car_trim t
JOIN car_model m ON m.model_id = t.model_id
WHERE o.car_trim_id = t.trim_id
  AND o.vehicle_name IS NULL;

ALTER TABLE orders
    ALTER COLUMN vehicle_name SET NOT NULL;
