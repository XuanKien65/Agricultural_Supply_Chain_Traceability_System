CREATE DATABASE [AgriTraceabilityDB];
GO

USE [AgriTraceabilityDB];
GO

-- =========================================================================
-- TẠO CÁC BẢNG THEO ĐÚNG ĐẶC TẢ SCHEMA V2.0
-- =========================================================================

-- 1. Bảng Organizations
CREATE TABLE Organizations (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- FARM / PROCESSOR / DISTRIBUTOR / RETAILER
    Status NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE / INACTIVE / SUSPENDED
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- 2. Bảng Users
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(200),
    Email NVARCHAR(200) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(500),
    Role NVARCHAR(50) NOT NULL, -- ADMIN / ORGADMIN / FARMER / OPERATOR / INSPECTOR
    OrganizationId INT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Users_Organizations FOREIGN KEY (OrganizationId) REFERENCES Organizations(Id)
);
GO

-- 3. Bảng Products
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200),
    Category NVARCHAR(100),
    Unit NVARCHAR(50),
    OrganizationId INT NOT NULL,
    CONSTRAINT FK_Products_Organizations FOREIGN KEY (OrganizationId) REFERENCES Organizations(Id)
);
GO

-- 4. Bảng Batches
CREATE TABLE Batches (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    BatchCode NVARCHAR(100) UNIQUE NOT NULL,
    Quantity DECIMAL(18,2) NOT NULL,
    CurrentOrganizationId INT NULL,
    ParentBatchId INT NULL,
    RootBatchId INT NULL,
    QRCode NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Batches_Products FOREIGN KEY (ProductId) REFERENCES Products(Id),
    CONSTRAINT FK_Batches_Organizations FOREIGN KEY (CurrentOrganizationId) REFERENCES Organizations(Id),
    CONSTRAINT FK_Batches_Parent FOREIGN KEY (ParentBatchId) REFERENCES Batches(Id)
);
GO

-- 5. Bảng SupplyChainEvents
CREATE TABLE SupplyChainEvents (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BatchId INT NOT NULL,
    EventType NVARCHAR(50) NOT NULL, -- HARVEST / PROCESS / PACKAGE / TRANSPORT / INSPECT / RECEIVE / SPLIT / MERGE
    OrganizationId INT NOT NULL,
    UserId INT NOT NULL,
    EventData NVARCHAR(MAX),
    Location NVARCHAR(200),
    PreviousHash NVARCHAR(500),
    CurrentHash NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Events_Batches FOREIGN KEY (BatchId) REFERENCES Batches(Id),
    CONSTRAINT FK_Events_Organizations FOREIGN KEY (OrganizationId) REFERENCES Organizations(Id),
    CONSTRAINT FK_Events_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

-- 6. Bảng BatchImages
CREATE TABLE BatchImages (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BatchId INT NOT NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    Caption NVARCHAR(200),
    DisplayOrder INT DEFAULT 0,
    EventId INT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_BatchImages_Batches FOREIGN KEY (BatchId) REFERENCES Batches(Id),
    CONSTRAINT FK_BatchImages_Events FOREIGN KEY (EventId) REFERENCES SupplyChainEvents(Id)
);
GO

-- 7. Bảng Inspections
CREATE TABLE Inspections (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BatchId INT NOT NULL,
    InspectorId INT NOT NULL,
    Result NVARCHAR(100), -- PASS / FAIL / PENDING
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Inspections_Batches FOREIGN KEY (BatchId) REFERENCES Batches(Id),
    CONSTRAINT FK_Inspections_Users FOREIGN KEY (InspectorId) REFERENCES Users(Id)
);
GO

-- 8. Bảng Certificates
CREATE TABLE Certificates (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BatchId INT NOT NULL,
    InspectionId INT NULL,
    CertificateType NVARCHAR(100),
    FileUrl NVARCHAR(500),
    IssuedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Certificates_Batches FOREIGN KEY (BatchId) REFERENCES Batches(Id),
    CONSTRAINT FK_Certificates_Inspections FOREIGN KEY (InspectionId) REFERENCES Inspections(Id)
);
GO

-- 9. Bảng Recalls
CREATE TABLE Recalls (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BatchId INT NOT NULL,
    Reason NVARCHAR(500),
    Severity NVARCHAR(50), -- LOW / MEDIUM / HIGH / CRITICAL
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Recalls_Batches FOREIGN KEY (BatchId) REFERENCES Batches(Id),
    CONSTRAINT FK_Recalls_Users FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
);
GO

-- 10. Bảng Notifications
CREATE TABLE Notifications (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Title NVARCHAR(200),
    Message NVARCHAR(MAX),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

-- 11. Bảng BatchRelations
CREATE TABLE BatchRelations (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SourceBatchId INT NOT NULL,
    TargetBatchId INT NOT NULL,
    RelationType NVARCHAR(50), -- SPLIT / MERGE
    Quantity DECIMAL(18,2),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Rel_Source FOREIGN KEY (SourceBatchId) REFERENCES Batches(Id),
    CONSTRAINT FK_Rel_Target FOREIGN KEY (TargetBatchId) REFERENCES Batches(Id)
);
GO