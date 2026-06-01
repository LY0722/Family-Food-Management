package com.jdzu.familyfood.controller;

import com.jdzu.familyfood.service.ConsumptionService;
import com.jdzu.familyfood.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/report")
@RequiredArgsConstructor
public class ReportController {

    private final ConsumptionService consumptionService;

    @GetMapping("/consumption-trend")
    public ApiResponse getConsumptionTrend(@RequestParam Long familyId,
                                           @RequestParam(defaultValue = "week") String period) {
        try {
            Map<String, Object> trendData = consumptionService.getConsumptionTrend(familyId, period);
            return ApiResponse.success(trendData);
        } catch (Exception e) {
            return ApiResponse.error("获取消耗趋势失败: " + e.getMessage());
        }
    }

    @GetMapping("/waste-statistics")
    public ApiResponse getWasteStatistics(@RequestParam Long familyId) {
        try {
            Map<String, Object> statistics = consumptionService.getWasteStatistics(familyId);
            return ApiResponse.success(statistics);
        } catch (Exception e) {
            return ApiResponse.error("获取浪费统计失败: " + e.getMessage());
        }
    }

    @GetMapping("/consumption-report")
    public ApiResponse getConsumptionReport(@RequestParam Long familyId,
                                           @RequestParam String startDate,
                                           @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            List<Map<String, Object>> report = consumptionService.getConsumptionReport(familyId, start, end);
            return ApiResponse.success(report);
        } catch (Exception e) {
            return ApiResponse.error("获取消耗报告失败: " + e.getMessage());
        }
    }
}