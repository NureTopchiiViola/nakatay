package com.nakatay.backend.car;

import com.nakatay.backend.car.dto.CarFilterParams;
import com.nakatay.backend.car.dto.CarListItemResponse;
import com.nakatay.backend.car.dto.CarTrimDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;


@Tag(name = "Каталог авто", description = "Ендпоінти для пошуку, фільтрації, сортування та перегляду конкретної комплектації")
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {
    private final CarService carService;

    @Operation(
            summary = "Отримання детальної інформації про конкретну комплектацію",
            description = """
            Повертає детальні характеристики та масив URL зображень для конкретного `trim_id`.
            
            Якщо комплектацію не знайдено, повертає `404 Not Found`.
            """
    )
    @GetMapping("/{id}")
    public CarTrimDto getCar(@PathVariable Long id) {
        return carService.getCarById(id);
    }


    @Operation(
            summary = "Пошук та фільтрація по всьому каталогу",
            description = """
            ### Інструкція
            Запит будується за загальним виглядом 
            http://localhost:8081/api/cars/search?параметр1=значення&параметр2=значення і тд, або ж дефолт
            http://localhost:8081/api/cars/search
            1. **Пагінація:**
               `page`: номер сторінки (починається з `0`, за замовчуванням: `0`).
               `size`: розмір сторінки (за замовчуванням: `12`).
               
            2. **Правила сортування (`sort=поле,направлення`):**
               За замовчуванням: `carModel.createdAt,desc` (спочатку нові за датою додавання).
               Сортування по полю моделі: `carModel.brand,asc` або `carModel.basePrice,desc`.
               Сортування по полю комплектації: `year,desc`, `trimName,asc`.
               Напрями desc - за спаданням, asc - за зростанням.
               
            3. **Множинний вибір:**
               Для передач/кузовів передавайте параметри повторно:
                 `?bodyTypes=SEDAN&bodyTypes=COUPE&transmissions=AUTOMATIC`
                 
            4. **Пошук (`query`):**
               Шукає незалежно від регістра по: **Brand**, **ModelName** и **TrimName**.
            """
    )
    @GetMapping("/search")
    public Page<CarListItemResponse> getCatalog(
            @ModelAttribute CarFilterParams filter,
            @PageableDefault(size = 12, sort = "carModel.createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        return carService.searchCars(filter, pageable);
    }

}
