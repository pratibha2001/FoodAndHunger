package com.foodandhunger.backend.SecurityCnfig;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig implements WebMvcConfigurer {

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable()) //  disable CSRF for Postman
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/api/auth/**", //  signup/login routes
                                                                "/api/donation/**", //  donation routes
                                                                "/api/donor/**",
                                                                "/api/request/**",
                                                                "/api/recipient/**",
                                                                "/api/feedback/**",
                                                                "/api/volunteer/**",
                                                                "/api/admin/**")
                                                .permitAll() //  allow all these
                                                .anyRequest().permitAll() //  also allow everything else (for now)
                                )
                                .formLogin(form -> form.disable())
                                .httpBasic(basic -> basic.disable());

                return http.build();
        }

        //  CORS config
        @Override
        public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                                .allowedOrigins("*")
                                .allowedMethods("*")
                                .allowedHeaders("*");
        }
}
