ALTER TABLE favorite_cars
    ADD COLUMN car_trim_id BIGINT REFERENCES car_trim(trim_id);

UPDATE favorite_cars favorite
SET car_trim_id = (
    SELECT MIN(trim_id)
    FROM car_trim
    WHERE model_id = favorite.car_model_id
      AND is_available = TRUE
);

ALTER TABLE favorite_cars
    DROP CONSTRAINT uq_user_favorite_car;

ALTER TABLE favorite_cars
    ADD CONSTRAINT uq_user_favorite_trim UNIQUE (user_id, car_trim_id);

CREATE INDEX idx_favorite_cars_car_trim_id ON favorite_cars(car_trim_id);
