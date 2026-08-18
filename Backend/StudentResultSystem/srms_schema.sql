-- MySQL Database Schema for Student Result Management System (SRMS)
-- Generated from AppDbContext and Domain Entities

CREATE DATABASE IF NOT EXISTS `srms`;
USE `srms`;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables in reverse order of dependencies to avoid foreign key errors
DROP TABLE IF EXISTS `result`;
DROP TABLE IF EXISTS `enrollment`;
DROP TABLE IF EXISTS `course`;
DROP TABLE IF EXISTS `academicterm`;
DROP TABLE IF EXISTS `student`;
DROP TABLE IF EXISTS `department`;
DROP TABLE IF EXISTS `userrole`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `role`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Create 'role' table
CREATE TABLE `role` (
  `Id` INT AUTO_INCREMENT,
  `Name` VARCHAR(10) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Create 'users' table
CREATE TABLE `users` (
  `Id` INT AUTO_INCREMENT,
  `Username` VARCHAR(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `PasswordHash` VARCHAR(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Email` VARCHAR(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Username` (`Username`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Create 'userrole' table (junction table for many-to-many relationship)
CREATE TABLE `userrole` (
  `UserId` INT NOT NULL,
  `RoleId` INT NOT NULL,
  PRIMARY KEY (`UserId`, `RoleId`),
  KEY `RoleId` (`RoleId`),
  CONSTRAINT `userrole_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`),
  CONSTRAINT `userrole_ibfk_2` FOREIGN KEY (`RoleId`) REFERENCES `role` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Create 'department' table
CREATE TABLE `department` (
  `Id` INT AUTO_INCREMENT,
  `DeptName` VARCHAR(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Code` VARCHAR(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Code` (`Code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Create 'student' table (note: Id is not auto-incremented as per EF configuration)
CREATE TABLE `student` (
  `Id` INT NOT NULL,
  `StudentName` VARCHAR(50) NOT NULL,
  `RegNo` VARCHAR(50) NOT NULL,
  `Email` VARCHAR(50) NOT NULL,
  `DepartmentId` INT NOT NULL,
  `BatchYear` VARCHAR(4) NOT NULL,
  `UserId` INT DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `RegNo` (`RegNo`),
  UNIQUE KEY `Email` (`Email`),
  KEY `DepartmentId` (`DepartmentId`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `student_ibfk_1` FOREIGN KEY (`DepartmentId`) REFERENCES `department` (`Id`),
  CONSTRAINT `student_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Create 'academicterm' table
CREATE TABLE `academicterm` (
  `Id` INT AUTO_INCREMENT,
  `TermName` VARCHAR(30) NOT NULL,
  `TermNumber` VARCHAR(10) NOT NULL,
  `StartDate` DATE NOT NULL,
  `EndDate` DATE NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. Create 'course' table
CREATE TABLE `course` (
  `Id` INT AUTO_INCREMENT,
  `Title` VARCHAR(100) NOT NULL,
  `Code` VARCHAR(20) NOT NULL,
  `CreditHours` INT NOT NULL,
  `TermNumber` INT NOT NULL,
  `DepartmentId` INT NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Code` (`Code`),
  KEY `DepartmentId` (`DepartmentId`),
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`DepartmentId`) REFERENCES `department` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 8. Create 'enrollment' table
CREATE TABLE `enrollment` (
  `Id` INT AUTO_INCREMENT,
  `AcademicTermId` INT NOT NULL,
  `StudentID` INT NOT NULL,
  `CourseID` INT NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `StudentID` (`StudentID`, `CourseID`, `AcademicTermId`),
  KEY `AcademicTermId` (`AcademicTermId`),
  KEY `CourseID` (`CourseID`),
  CONSTRAINT `enrollment_ibfk_1` FOREIGN KEY (`AcademicTermId`) REFERENCES `academicterm` (`Id`),
  CONSTRAINT `enrollment_ibfk_2` FOREIGN KEY (`StudentID`) REFERENCES `student` (`Id`),
  CONSTRAINT `enrollment_ibfk_3` FOREIGN KEY (`CourseID`) REFERENCES `course` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 9. Create 'result' table
CREATE TABLE `result` (
  `Id` INT AUTO_INCREMENT,
  `EnrollmentId` INT NOT NULL,
  `GradePoint` DECIMAL(4,2) DEFAULT 0.00,
  `LetterGrade` VARCHAR(2) NOT NULL,
  `PublishedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `EnrollmentId` (`EnrollmentId`),
  CONSTRAINT `result_ibfk_1` FOREIGN KEY (`EnrollmentId`) REFERENCES `enrollment` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Seed system roles (required by the backend auth/user logic)
INSERT INTO `role` (`Id`, `Name`) VALUES
(1, 'Admin'),
(2, 'Teacher'),
(3, 'Student');
