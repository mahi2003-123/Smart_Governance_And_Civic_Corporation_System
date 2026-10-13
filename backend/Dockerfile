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
# Copy only the compiled fat JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Use 70% of the container RAM for the JVM heap; avoids OOM on Render free tier
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-jar", "app.jar"]
