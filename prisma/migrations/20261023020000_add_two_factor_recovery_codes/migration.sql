ALTER TABLE `admins`
  ADD COLUMN `two_factor_recovery_codes` TEXT NULL;

ALTER TABLE `teachers`
  ADD COLUMN `two_factor_recovery_codes` TEXT NULL;
