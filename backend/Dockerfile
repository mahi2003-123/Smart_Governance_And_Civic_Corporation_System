# Stage 1: Build the application using Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Compile and package the application into a JAR
RUN mvn clean package -DskipTests

# Stage 2: Run the generated Spring Boot JAR
FROM eclipse-temurin:17-jre
WORKDIR /app
# Copy only the compiled fat JAR from the build stage smoothly resolving the exact artifact name
COPY --from=build /app/target/*.jar app.jar

# Start the Spring Boot application (using the ${PORT:5000} bindings provided in application.properties)
ENTRYPOINT ["java", "-jar", "app.jar"]
