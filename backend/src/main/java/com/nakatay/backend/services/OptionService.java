package com.nakatay.backend.services;

import com.nakatay.backend.dto.request.ConfigRequest;
import com.nakatay.backend.dto.request.PriceRequest;
import com.nakatay.backend.dto.response.ConfigResponse;
import com.nakatay.backend.dto.response.OptionDto;
import com.nakatay.backend.dto.response.PriceResponse;
import com.nakatay.backend.models.Option;
import com.nakatay.backend.models.SavedConfig;

import java.math.BigDecimal;
import java.util.List;


public interface OptionService {
    public List<OptionDto> getOptionsForTrim(Long trimId);
    public PriceResponse calculatePrice(PriceRequest request);
    public ConfigResponse getByShareCode(String shareCode);
    public ConfigResponse saveConfiguration(ConfigRequest request);
}
