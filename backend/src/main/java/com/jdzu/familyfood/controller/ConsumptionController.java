package com.jdzu.familyfood.controller;

import com.jdzu.familyfood.service.ConsumptionService;
import com.jdzu.familyfood.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/consumption")
@RequiredArgsConstructor
public class ConsumptionController {

    private final ConsumptionService consumptionService;

    /**
     * 获取消耗报告
     * GET /consumption/report?familyId=1&startDate=2024-01-01&endDate=2024-01-31
     */
    @GetMapping("/report")
    public ApiResponse getConsumptionReport(
            @RequestParam Long familyId,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        List<Map<String, Object>> report = consumptionService.getConsumptionReport(familyId, start, end);
        return ApiResponse.ok(report);
    }

    /**
     * 获取浪费统计
     * GET /consumption/waste-statistics?familyId=1
     */
    @GetMapping("/waste-statistics")
    public ApiResponse getWasteStatistics(@RequestParam Long familyId) {
        Map<String, Object> statistics = consumptionService.getWasteStatistics(familyId);
        return ApiResponse.ok(statistics);
    }

    /**
     * 获取消耗趋势数据（用于图表）
     * GET /consumption/trend?familyId=1&period=week
     */
    @GetMapping("/trend")
    public ApiResponse getConsumptionTrend(
            @RequestParam Long familyId,
            @RequestParam(defaultValue = "week") String period) {

        Map<String, Object> trend = consumptionService.getConsumptionTrend(familyId, period);
        return ApiResponse.ok(trend);
    }
}