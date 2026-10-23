UPDATE `records`
SET `approval_status` = 'Not Required',
    `approved_by` = NULL,
    `approved_at` = NULL
WHERE COALESCE(`reported_by_type`, 'admin') <> 'teacher';

DELETE `case_threads`
FROM `case_threads`
INNER JOIN `records` ON `records`.`id` = `case_threads`.`record_id`
WHERE COALESCE(`records`.`reported_by_type`, 'admin') <> 'teacher';

ALTER TABLE `records`
  ALTER COLUMN `approval_status` SET DEFAULT 'Not Required';
