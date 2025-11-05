-- Seed Data for Lab Link
-- Run this after creating the schema

-- ============================================
-- INSERT DIAGNOSTIC CENTRES
-- ============================================
INSERT INTO public.diagnostic_centres (id, name, city, phone, address, rating) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Vijaya Diagnostics', 'Hyderabad', '+91 40 1234 5678', 'Road No. 36, Jubilee Hills, Hyderabad', 4.9),
  ('22222222-2222-2222-2222-222222222222', 'Thyrocare', 'Mumbai', '+91 22 1234 5678', 'Andheri East, Mumbai', 4.7),
  ('33333333-3333-3333-3333-333333333333', 'Lucid Diagnostics', 'Bangalore', '+91 80 1234 5678', 'Koramangala, Bangalore', 4.8)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERT TESTS
-- ============================================
INSERT INTO public.tests (id, name, description, category, sample_type, tests_included, parameters, preparation_instructions) VALUES
  ('test-111111111111', 'Complete Blood Count (CBC)', 'Comprehensive blood analysis including RBC, WBC, Platelets, Hemoglobin', 'blood', 'Blood', 28, '["Hemoglobin", "RBC Count", "WBC Count", "Platelets", "MCV", "MCH", "MCHC"]', 'No special preparation required'),
  ('test-222222222222', 'HbA1c (Glycated Hemoglobin)', '3-month average blood sugar monitoring for diabetes management', 'blood', 'Blood', 1, '["HbA1c"]', 'No fasting required'),
  ('test-333333333333', 'Thyroid Profile (Total)', 'Complete thyroid function test - T3, T4, TSH', 'blood', 'Blood', 3, '["T3", "T4", "TSH"]', 'Fasting for 8-12 hours recommended'),
  ('test-444444444444', 'Fasting Blood Sugar (FBS)', 'Blood glucose test after overnight fasting', 'blood', 'Blood', 1, '["Glucose Fasting"]', 'Fasting for 8-12 hours required'),
  ('test-555555555555', 'Lipid Profile', 'Cholesterol and triglycerides test for heart health', 'blood', 'Blood', 8, '["Total Cholesterol", "HDL", "LDL", "Triglycerides", "VLDL"]', 'Fasting for 12-14 hours required'),
  ('test-666666666666', 'Vitamin D (25-OH)', 'Vitamin D deficiency test', 'blood', 'Blood', 1, '["Vitamin D"]', 'No special preparation required')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERT SCANS
-- ============================================
INSERT INTO public.scans (id, name, description, category, preparation_instructions) VALUES
  ('scan-111111111111', 'USG Abdomen (Complete)', 'Ultrasound scan of abdominal organs including liver, kidney, spleen', 'ultrasound', 'Empty stomach for 6 hours, full bladder'),
  ('scan-222222222222', 'CT Brain (Plain)', 'Computed Tomography scan of brain', 'ct', 'No special preparation required'),
  ('scan-333333333333', '2D ECHO (Echocardiogram)', 'Heart ultrasound to check cardiac function', 'ultrasound', 'No special preparation required'),
  ('scan-444444444444', 'ECG (Electrocardiogram)', 'Heart rhythm and electrical activity test', 'ecg', 'Wear loose clothing'),
  ('scan-555555555555', 'MRI Spine (Lumbar)', 'Magnetic Resonance Imaging of lower spine', 'mri', 'Remove all metal objects'),
  ('scan-666666666666', 'X-Ray Chest (PA View)', 'Chest X-ray for lung and heart evaluation', 'xray', 'No special preparation required')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERT PACKAGES
-- ============================================
INSERT INTO public.packages (id, name, description, tests_included, included_tests, popular) VALUES
  ('pkg-111111111111', 'Diabetes Profile', 'Complete diabetes screening and monitoring package', 8, '["FBS", "PPBS", "HbA1c", "Lipid Profile", "Kidney Function", "Urine R/M"]', true),
  ('pkg-222222222222', 'Full Body Checkup', 'Comprehensive health screening package', 72, '["CBC", "Lipid Profile", "Liver Function", "Kidney Function", "Thyroid Profile", "Vitamin D", "Diabetes Tests"]', true),
  ('pkg-333333333333', 'Master Health Checkup', 'Premium comprehensive health package', 110, '["All Blood Tests", "ECG", "X-Ray Chest", "USG Abdomen", "Full Body Analysis"]', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERT CENTRE PRICING FOR TESTS
-- ============================================
INSERT INTO public.centre_pricing (centre_id, item_type, item_id, price, original_price, discount, report_delivery_time, home_collection) VALUES
  -- CBC pricing
  ('11111111-1111-1111-1111-111111111111', 'test', 'test-111111111111', 350, 500, 30, '6 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'test', 'test-111111111111', 320, 450, 29, '12 hours', true),
  ('33333333-3333-3333-3333-333333333333', 'test', 'test-111111111111', 380, 520, 27, '8 hours', true),
  -- HbA1c pricing
  ('11111111-1111-1111-1111-111111111111', 'test', 'test-222222222222', 480, 650, 26, '24 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'test', 'test-222222222222', 450, 600, 25, '12 hours', true),
  -- Thyroid Profile pricing
  ('11111111-1111-1111-1111-111111111111', 'test', 'test-333333333333', 600, 850, 29, '24 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'test', 'test-333333333333', 550, 800, 31, '24 hours', true),
  ('33333333-3333-3333-3333-333333333333', 'test', 'test-333333333333', 580, 850, 32, '18 hours', true),
  -- FBS pricing
  ('11111111-1111-1111-1111-111111111111', 'test', 'test-444444444444', 180, 250, 28, '6 hours', true),
  ('33333333-3333-3333-3333-333333333333', 'test', 'test-444444444444', 200, 280, 29, '8 hours', true),
  -- Lipid Profile pricing
  ('11111111-1111-1111-1111-111111111111', 'test', 'test-555555555555', 450, 650, 31, '12 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'test', 'test-555555555555', 420, 600, 30, '12 hours', true),
  -- Vitamin D pricing
  ('22222222-2222-2222-2222-222222222222', 'test', 'test-666666666666', 800, 1100, 27, '48 hours', true),
  ('33333333-3333-3333-3333-333333333333', 'test', 'test-666666666666', 850, 1200, 29, '48 hours', true)
ON CONFLICT (centre_id, item_type, item_id) DO NOTHING;

-- ============================================
-- INSERT CENTRE PRICING FOR SCANS
-- ============================================
INSERT INTO public.centre_pricing (centre_id, item_type, item_id, price, original_price, discount, report_delivery_time, home_collection) VALUES
  -- USG Abdomen
  ('11111111-1111-1111-1111-111111111111', 'scan', 'scan-111111111111', 1200, 1500, 20, '24 hours', false),
  ('33333333-3333-3333-3333-333333333333', 'scan', 'scan-111111111111', 1350, 1600, 16, '24 hours', false),
  -- CT Brain
  ('33333333-3333-3333-3333-333333333333', 'scan', 'scan-222222222222', 2800, 3500, 20, '24 hours', false),
  -- 2D ECHO
  ('11111111-1111-1111-1111-111111111111', 'scan', 'scan-333333333333', 1500, 2000, 25, '6 hours', false),
  ('22222222-2222-2222-2222-222222222222', 'scan', 'scan-333333333333', 1600, 2100, 24, '12 hours', false),
  -- ECG
  ('11111111-1111-1111-1111-111111111111', 'scan', 'scan-444444444444', 250, 350, 29, '2 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'scan', 'scan-444444444444', 280, 380, 26, '4 hours', true),
  -- MRI Spine
  ('33333333-3333-3333-3333-333333333333', 'scan', 'scan-555555555555', 4500, 6000, 25, '48 hours', false),
  -- X-Ray Chest
  ('11111111-1111-1111-1111-111111111111', 'scan', 'scan-666666666666', 300, 400, 25, '2 hours', false),
  ('22222222-2222-2222-2222-222222222222', 'scan', 'scan-666666666666', 320, 420, 24, '4 hours', false)
ON CONFLICT (centre_id, item_type, item_id) DO NOTHING;

-- ============================================
-- INSERT CENTRE PRICING FOR PACKAGES
-- ============================================
INSERT INTO public.centre_pricing (centre_id, item_type, item_id, price, original_price, discount, report_delivery_time, home_collection) VALUES
  -- Diabetes Profile
  ('11111111-1111-1111-1111-111111111111', 'package', 'pkg-111111111111', 999, 1499, 33, '24 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'package', 'pkg-111111111111', 949, 1399, 32, '24 hours', true),
  -- Full Body Checkup
  ('11111111-1111-1111-1111-111111111111', 'package', 'pkg-222222222222', 2199, 4399, 50, '48 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'package', 'pkg-222222222222', 1999, 3999, 50, '48 hours', true),
  ('33333333-3333-3333-3333-333333333333', 'package', 'pkg-222222222222', 2299, 4599, 50, '36 hours', true),
  -- Master Health Checkup
  ('33333333-3333-3333-3333-333333333333', 'package', 'pkg-333333333333', 3999, 7999, 50, '72 hours', true)
ON CONFLICT (centre_id, item_type, item_id) DO NOTHING;
