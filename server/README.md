# FitLog Server

`server/` is the Spring Boot backend for FitLog.

## Stack

- Spring Boot `3.5.13`
- Java `17`
- Gradle Wrapper
- MySQL `8.x`

I chose Spring Boot `3.5.13` because it is a current stable Spring Boot line and fits the installed Java 17 runtime well, while avoiding the sharper migration edge of the newer 4.x line for an early project setup.

Official references:

- https://docs.spring.io/spring-boot/system-requirements.html
- https://spring.io/projects/spring-boot/

## Profiles

- `local`: connects to local MySQL and enables `ddl-auto=update`
- `prod`: keeps `ddl-auto=validate`
- `test`: uses in-memory H2 so tests run without MySQL

## Environment Variables

The app reads these environment variables:

- `DB_HOST` default: `localhost`
- `DB_PORT` default: `3306`
- `DB_NAME` default: `fitlog`
- `DB_USERNAME` default: `root`
- `DB_PASSWORD` default: empty
- `WEB_ORIGIN` default: `http://localhost:3000`
- `SERVER_PORT` default: `8080`

For local development, the project also supports a Git-ignored file:

- `local-secrets.properties`

## Local Run

PowerShell example:

Current local setup is already configured through `local-secrets.properties`, so you can run:

```powershell
.\gradlew.bat bootRun
```

If you use a dedicated MySQL user instead of `root`:

```powershell
$env:DB_USERNAME='fitlog_app'
$env:DB_PASSWORD='your-app-password'
.\gradlew.bat bootRun
```

## Create Database

The local MySQL service is running on `localhost:3306`.

```powershell
& 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe' -u root -p -e "CREATE DATABASE IF NOT EXISTS fitlog CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
```

Optional app user creation:

```powershell
& 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe' -u root -p -e "CREATE USER IF NOT EXISTS 'fitlog_app'@'localhost' IDENTIFIED BY 'change-me'; GRANT ALL PRIVILEGES ON fitlog.* TO 'fitlog_app'@'localhost'; FLUSH PRIVILEGES;"
```

## Verification

- app health: `GET http://localhost:8080/api/health`
- actuator health: `GET http://localhost:8080/actuator/health`

## Test

```powershell
.\gradlew.bat test
```
