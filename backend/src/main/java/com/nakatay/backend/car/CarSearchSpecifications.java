package com.nakatay.backend.car;

import com.nakatay.backend.car.CarTrim;
import com.nakatay.backend.car.dto.CarFilterParams;
import jakarta.persistence.criteria.Expression;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CarSearchSpecifications {

    public static Specification<CarTrim> withFilters(CarFilterParams filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (Long.class != query.getResultType()) {
                root.fetch("carModel", JoinType.INNER);
            }

            var carModelJoin = root.join("carModel", JoinType.INNER);

            // only available
            predicates.add(cb.isTrue(root.get("isAvailable")));
            predicates.add(cb.isFalse(carModelJoin.get("isDeleted")));

            if (filter != null) {
                // search filter
                if (filter.query() != null && !filter.query().isBlank()) {
                    String searchPattern = "%" + filter.query().toLowerCase() + "%";
                    Predicate brandMatch = cb.like(cb.lower(carModelJoin.get("brand")), searchPattern);
                    Predicate modelMatch = cb.like(cb.lower(carModelJoin.get("modelName")), searchPattern);
                    Predicate trimMatch = cb.like(cb.lower(root.get("trimName")), searchPattern);

                    predicates.add(cb.or(brandMatch, modelMatch, trimMatch));
                }
                // year filter
                if (filter.minYear() != null) predicates.add(cb.greaterThanOrEqualTo(root.get("year"), filter.minYear()));
                if (filter.maxYear() != null) predicates.add(cb.lessThanOrEqualTo(root.get("year"), filter.maxYear()));

                // brand filter
                if (filter.brands() != null && !filter.brands().isEmpty()) {
                    predicates.add(carModelJoin.get("brand").in(filter.brands()));
                }

                // model filter
                if (filter.models() != null && !filter.models().isEmpty()) {
                    predicates.add(carModelJoin.get("modelName").in(filter.models()));
                }

                // body type filter
                if (filter.bodyTypes() != null && !filter.bodyTypes().isEmpty()) {
                    predicates.add(carModelJoin.get("bodyType").in(filter.bodyTypes()));
                }

                // transmission filter
                if (filter.transmissions() != null && !filter.transmissions().isEmpty()) {
                    predicates.add(root.get("transmission").in(filter.transmissions()));
                }

                // engine filter
                if (filter.engines() != null && !filter.engines().isEmpty()) {
                    predicates.add(root.get("engine").in(filter.engines()));
                }

                // price filter
                if (filter.minPrice() != null || filter.maxPrice() != null) {
                    Expression<BigDecimal> basePrice = carModelJoin.get("basePrice");
                    Expression<BigDecimal> priceModifier = root.get("priceModifier");
                    Expression<BigDecimal> totalPrice = cb.sum(basePrice, priceModifier);

                    if (filter.minPrice() != null) predicates.add(cb.greaterThanOrEqualTo(totalPrice, filter.minPrice()));
                    if (filter.maxPrice() != null) predicates.add(cb.lessThanOrEqualTo(totalPrice, filter.maxPrice()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}