# -------------------------------------
# Build server
FROM mcr.microsoft.com/dotnet/core/sdk:3.1-alpine AS server-build
WORKDIR /app

# Project files with dependencies as its own layer to aid caching
COPY server/src/MythicTable/*.csproj ./src/MythicTable/
WORKDIR src/MythicTable/
RUN dotnet restore

WORKDIR /app
COPY server/. .
WORKDIR src/MythicTable
RUN dotnet publish -c Release -o /app/out


#--------------------------------------
# Build client
FROM node:lts-alpine AS client-build
WORKDIR /src

# Cache node dependencies in own layer
COPY html/package.json html/package-lock.json ./
RUN npm install

WORKDIR /src
COPY html .
RUN npm run build


#--------------------------------------
# Combine server and client into package
FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-alpine AS runtime
WORKDIR /app
COPY --from=server-build /app/out/. .
COPY --from=client-build /src/dist/. ./wwwroot

EXPOSE 80
ENTRYPOINT [ "dotnet", "/app/MythicTable.dll" ]
