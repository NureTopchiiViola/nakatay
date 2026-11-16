package com.nakatay.backend.services;

import com.nakatay.backend.dto.request.ConfigRequest;
import com.nakatay.backend.dto.request.PriceRequest;
import com.nakatay.backend.dto.response.ConfigResponse;
import com.nakatay.backend.dto.response.OptionDto;
import com.nakatay.backend.dto.response.PriceResponse;
import com.nakatay.backend.models.User;

import java.util.List;


public interface OptionService {
    List<OptionDto> getOptionsForTrim(Long trimId);
    PriceResponse calculatePrice(PriceRequest request);
    ConfigResponse saveConfiguration(ConfigRequest request, User currentUser);
    ConfigResponse getByShareCode(String shareCode, User currentUser);
    List<ConfigResponse> getMyConfigurations(User currentUser);
    ConfigResponse updateVisibility(Long configId, boolean isPublic, User currentUser);
    ConfigResponse cloneByShareCode(String shareCode, User currentUser);
    void deleteConfiguration(Long configId, User currentUser);
}
