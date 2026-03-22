# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml ./
COPY src ./src
RUN mvn -B -DskipTests clean package \
    && cp target/*.jar /workspace/app.jar

FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /app

RUN addgroup --system spring \
    && adduser --system --ingroup spring spring \
    && mkdir -p /app/data \
    && chown -R spring:spring /app

COPY --from=build /workspace/app.jar /app/app.jar

USER spring:spring
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

