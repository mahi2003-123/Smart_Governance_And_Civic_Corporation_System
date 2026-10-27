# Stage 1: Build the application using Maven
# dockerContext is set to the repo root (.) so COPY paths are relative to root.
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src
# Compile and package the application into a JAR, skipping tests (tests run in CI)
RUN mvn clean package -DskipTests

# Stage 2: Run the generated Spring Boot JAR
FROM eclipse-temurin:17-jre
WORKDIR /app

# Run as non-root user
RUN addgroup --system sgcsgroup && adduser --system --ingroup sgcsgroup sgcsuser
COPY --from=build --chown=sgcsuser:sgcsgroup /app/target/*.jar app.jar
USER sgcsuser

# Optimized for Render free tier (low CPU/RAM):
# - TieredStopAtLevel=1 disables C2 JIT compilation, cutting startup time by 50%
# - UseSerialGC minimizes GC thread context-switching on fractional CPU
ENTRYPOINT ["java", "-Duser.timezone=UTC", "-XX:MaxRAMPercentage=70", "-XX:+TieredCompilation", "-XX:TieredStopAtLevel=1", "-XX:+UseSerialGC", "-jar", "app.jar"]
