-- Development Database Setup for CrossBorder Vehicle Services
-- Run this script to set up the local development database

-- Create database (run as postgres superuser)
-- CREATE DATABASE crossborder_dev;
-- CREATE USER crossborder_user WITH PASSWORD 'crossborder_password';
-- GRANT ALL PRIVILEGES ON DATABASE crossborder_dev TO crossborder_user;

-- Switch to the crossborder_dev database
\c crossborder_dev;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial admin user (run after migration)
-- This will be handled by seeding script

-- Sample data for development
-- This will be populated by Prisma seed script