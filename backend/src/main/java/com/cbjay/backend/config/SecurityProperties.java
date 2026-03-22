package com.cbjay.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app.security")
public record SecurityProperties(
        String h2ConsolePath,
        List<String> permitPost,
        List<String> permitGet
) {
}

