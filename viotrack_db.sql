-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 14, 2026 at 06:33 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `viotrack_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_name` varchar(150) NOT NULL,
  `user_role` varchar(50) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `audit_id` varchar(80) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_name`, `user_role`, `action`, `details`, `audit_id`, `ip_address`, `device_info`, `created_at`) VALUES
(1, 'System Administrator', 'admin', 'Database Backup Created', 'Full system snapshot generated (0 violation records, 0 students) [SCHEDULED_DAILY]', NULL, '::1', NULL, '2026-10-12 19:44:41'),
(2, 'System Administrator', 'admin', 'Database Backup Created', 'Full system snapshot generated (0 violation records, 0 students) [SCHEDULED_DAILY]', NULL, '::1', NULL, '2026-10-12 19:45:25'),
(3, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Sleeping during class or activities\"', NULL, '::1', NULL, '2026-10-12 19:49:55'),
(4, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Uniform not worn or worn improperly\"', NULL, '::1', NULL, '2026-10-12 19:49:56'),
(5, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"School ID not worn properly\"', NULL, '::1', NULL, '2026-10-12 19:49:56'),
(6, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Playing non-educational games\"', NULL, '::1', NULL, '2026-10-12 19:49:56'),
(7, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Borrowing or lending money\"', NULL, '::1', NULL, '2026-10-12 19:49:56'),
(8, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Borrowing or lending money\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(9, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Bringing deadly weapons\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(10, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Cheating or academic dishonesty\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(11, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Cyberbullying\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(12, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Drinking alcohol in school\" (Major)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(13, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Drinking while Driving\" (Major)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(14, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Forgery or document tampering\" (Major)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(15, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Leaving classroom messy\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(16, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Loitering or shouting in hallways\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(17, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Major vandalism\" (Major)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(18, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Physical assault\" (Major)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(19, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Plagiarism\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(20, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Playing non-educational games\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(21, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Possession of smoking items / vape\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(22, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"School ID not worn properly\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(23, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Skipping class / truancy\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(24, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Sleeping during class or activities\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(25, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Uniform not worn or worn improperly\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(26, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Use of mobile gadgets without permission\" (Minor)', NULL, '::1', NULL, '2026-10-12 19:51:38'),
(27, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Wearing inappropriate clothing\"', NULL, '::1', NULL, '2026-10-12 19:52:02'),
(28, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Using vulgar language\"', NULL, '::1', NULL, '2026-10-12 19:52:02'),
(29, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Minor bullying or teasing\"', NULL, '::1', NULL, '2026-10-12 19:52:02'),
(30, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Making inappropriate jokes\"', NULL, '::1', NULL, '2026-10-12 19:52:02'),
(31, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Not completing clearance requirements\"', NULL, '::1', NULL, '2026-10-12 19:52:02'),
(32, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Borrowing or lending money\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(33, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Bringing deadly weapons\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(34, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Cheating or academic dishonesty\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(35, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Excessive jewelry or inappropriate appearance\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(36, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Fighting or causing disturbances\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(37, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Horseplay inside classroom\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(38, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Taking food without consent\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(39, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Not joining required school activities\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(40, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Chewing gum or spitting in public\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(41, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Buying food during class hours\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(42, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Using school properties without permission\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(43, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Forging parent\'s signature\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(44, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Misbehavior in the canteen\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(45, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Disturbing class sessions\"', NULL, '::1', NULL, '2026-10-12 19:52:36'),
(46, 'System Administrator', 'admin', 'Bulk Import', 'Bulk imported and enrolled 7 student records', NULL, '::1', NULL, '2026-10-12 19:53:33'),
(47, 'System Administrator', 'admin', 'Database Restored', 'Restored database from snapshot BKP-1791834959229 created on 10/13/2026', NULL, '::1', NULL, '2026-10-12 19:56:38'),
(48, 'System Administrator', 'admin', 'Database Restored', 'Restored database from snapshot BKP-1791834959229 created on 10/13/2026', NULL, '::1', NULL, '2026-10-12 19:57:04'),
(49, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Cheating during exams\" (Major)', NULL, '::1', NULL, '2026-10-12 20:03:17'),
(50, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Vandalism of school property\" (Major)', NULL, '::1', NULL, '2026-10-12 20:03:17'),
(51, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Uniform not worn properly\" (Minor)', NULL, '::1', NULL, '2026-10-12 20:03:17'),
(52, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Tardiness / Late to class\" (Minor)', NULL, '::1', NULL, '2026-10-12 20:03:17'),
(53, 'System Administrator', 'admin', 'Database Backup Created', 'Full system snapshot generated (0 violation records, 7 students) [SCHEDULED_DAILY]', NULL, '::1', NULL, '2026-10-13 11:03:14'),
(54, 'System Administrator', 'admin', 'Database Backup Created', 'Full system snapshot generated (0 violation records, 7 students) [SCHEDULED_DAILY]', NULL, '::1', NULL, '2026-10-13 11:19:29'),
(55, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Unauthorized playing in the gym\"', NULL, '::1', NULL, '2026-10-13 11:26:47'),
(56, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Rough or dangerous play\"', NULL, '::1', NULL, '2026-10-13 11:26:47'),
(57, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Plagiarism\"', NULL, '::1', NULL, '2026-10-13 11:26:47'),
(58, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Cheating or academic dishonesty\"', NULL, '::1', NULL, '2026-10-13 11:26:48'),
(59, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"dd\" (Minor)', NULL, '::1', NULL, '2026-10-13 11:33:47'),
(60, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Lying or misleading statements\"', NULL, '::1', NULL, '2026-10-13 11:34:18'),
(61, 'System Administrator', 'admin', 'Add Teacher', 'Registered faculty member dd dd.', NULL, '::1', NULL, '2026-10-13 11:39:55'),
(62, 'System Administrator', 'admin', 'Database Backup Created', 'Full system snapshot generated (0 violation records, 7 students) [SCHEDULED_DAILY]', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 12:17:48'),
(63, 'System Administrator', 'admin', 'Delete Teacher', 'Removed faculty member Juan Dela Cruz', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 12:21:41'),
(64, 'System Administrator', 'admin', 'Update Student', 'Updated profile information for student Isabella Ramos', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:24:40'),
(65, 'System Administrator', 'admin', 'Update Student', 'Updated profile information for student Christian Navarro', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:25:05'),
(66, 'System Administrator', 'admin', 'Update Student', 'Updated profile information for student Sophia Villanueva', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:25:22'),
(67, 'System Administrator', 'admin', 'Update Student', 'Updated profile information for student Gabriel Torres', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:25:41'),
(68, 'System Administrator', 'admin', 'Update Student', 'Updated profile information for student Alexander Mendoza', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:26:07'),
(69, 'System Administrator', 'admin', 'Update Student', 'Updated profile information for student Isabella Ramos', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:26:20'),
(70, 'System Administrator', 'admin', 'Update Student', 'Updated profile information for student Ber Andrei Carpio', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:26:28'),
(71, 'System Administrator', 'admin', 'Update Student', 'Updated profile information for student Christian Navarro', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:26:41'),
(72, 'System Administrator', 'admin', 'Update Student', 'Updated profile information for student Jasmine Castillo', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:27:07'),
(73, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Borrowing or lending money\" (Minor)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:29'),
(74, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Bringing deadly weapons\" (Minor)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:29'),
(75, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Cheating or academic dishonesty\" (Serious)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:29'),
(76, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Cyberbullying\" (Serious)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:29'),
(77, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Drinking alcohol in school\" (Major)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:29'),
(78, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Drinking while Driving\" (Major)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:29'),
(79, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Forgery or document tampering\" (Major)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:29'),
(80, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Leaving classroom messy\" (Minor)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:29'),
(81, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Loitering or shouting in hallways\" (Minor)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:29'),
(82, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Major vandalism\" (Major)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:29'),
(83, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Physical assault\" (Major)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:29'),
(84, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Plagiarism\" (Serious)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:30'),
(85, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Playing non-educational games\" (Minor)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:30'),
(86, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Possession of smoking items / vape\" (Serious)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:30'),
(87, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"School ID not worn properly\" (Minor)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:30'),
(88, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Skipping class / truancy\" (Serious)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:30'),
(89, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Sleeping during class or activities\" (Minor)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:30'),
(90, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Uniform not worn or worn improperly\" (Minor)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:30'),
(91, 'System Administrator', 'admin', 'Add Violation Category', 'Created category \"Use of mobile gadgets without permission\" (Minor)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:38:30'),
(92, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Possession of smoking items\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(93, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Vulgar or malicious acts\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(94, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Bribery or dishonest acts\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(95, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Theft or aiding theft\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(96, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Gambling or unauthorized collection\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(97, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Not delivering official communications\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(98, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Rude behavior to visitors or parents\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(99, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Disrespect to school authorities\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(100, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Use of vulgar language repeatedly\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(101, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Causing chaos during events\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(102, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Disrespect during flag ceremonies\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(103, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Property damage from mischief\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(104, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Playing non-educational games\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(105, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Entering/exiting without permission\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(106, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Public display of affection\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(107, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Minor vandalism\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(108, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Posting unauthorized notices\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(109, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Posting offensive content online\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(110, 'System Administrator', 'admin', 'Delete Violation Category', 'Removed violation category \"Removing school announcements\"', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 15:41:20'),
(111, 'System Administrator', 'admin', 'Add Violation', 'Logged incident \"Using fake receipts or forms\" for Ber Andrei Carpio.', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 16:05:33'),
(112, 'System Administrator', 'admin', 'Add Violation', 'Logged incident \"Uniform not worn or worn improperly\" for Ber Andrei Carpio.', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 16:05:33'),
(113, 'System Administrator', 'admin', 'Add Violation', 'Logged incident \"Playing non-educational games\" for Ber Andrei Carpio.', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 16:05:33'),
(114, 'System Administrator', 'admin', 'Add Violation', 'Logged incident \"Plagiarism\" for Ber Andrei Carpio.', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 16:05:33'),
(115, 'System Administrator', 'admin', 'Add Violation', 'Logged incident \"Rough or dangerous play\" for Ber Andrei Carpio.', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 16:05:33'),
(116, 'System Administrator', 'admin', 'Add Violation', 'Logged incident \"Lying or misleading statements\" for Ber Andrei Carpio.', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 16:05:33'),
(117, 'System Administrator', 'admin', 'Update Student', 'Updated profile information for student Ber Andrei Carpio', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 16:07:47'),
(118, 'System Administrator', 'admin', 'Add Teacher', 'Registered faculty member Anna Liza Villanueva.', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 16:09:46'),
(119, 'System Administrator', 'admin', 'Adviser Assigned', 'Appointed Anna Liza Villanueva as adviser for Grade 12 - ICT-1', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 16:10:24'),
(120, 'System Administrator', 'admin', 'Update Student', 'Updated profile information for student Ber Andrei Carpio', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 16:26:03'),
(121, 'System Administrator', 'admin', 'Update Teacher', 'Updated details for faculty Anna Liza Villanueva (#2)', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 17:00:56'),
(122, 'System Administrator', 'admin', 'Bulk Import', 'Bulk imported and enrolled 1 student records', NULL, '::ffff:127.0.0.1', NULL, '2026-10-13 17:12:19'),
(123, 'System Administrator', 'admin', 'Database Backup Created', 'Full system snapshot generated (6 violation records, 8 students) [SCHEDULED_DAILY]', NULL, '::ffff:127.0.0.1', NULL, '2026-10-14 12:27:46'),
(124, 'System Administrator', 'admin', 'Database Backup Created', 'Full system snapshot generated (6 violation records, 8 students) [SCHEDULED_DAILY]', NULL, '::ffff:127.0.0.1', NULL, '2026-10-14 13:19:59');

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fname` varchar(100) NOT NULL,
  `mname` varchar(100) NOT NULL DEFAULT '',
  `lname` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'admin',
  `position` varchar(100) NOT NULL DEFAULT 'Discipline Staff',
  `contact` varchar(30) NOT NULL DEFAULT '',
  `image` longtext DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `fname`, `mname`, `lname`, `email`, `password_hash`, `role`, `position`, `contact`, `image`, `created_at`) VALUES
(1, 'System', '', 'Administrator', 'admin@viotrack.edu', '$2b$12$njjce.VlFUPZPlhC5zeLxujNVJtbZqc44jVRHexNEJNo8.TqkR5/e', 'admin', 'Head Admin', '', 'data:image/jpeg;base64,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', '2026-10-12 19:39:47');

-- --------------------------------------------------------

--
-- Table structure for table `advisers`
--

CREATE TABLE `advisers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `grade_level` varchar(20) NOT NULL,
  `class_section` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `advisers`
--

INSERT INTO `advisers` (`id`, `teacher_id`, `grade_level`, `class_section`, `created_at`) VALUES
(1, 2, 'Grade 12', 'ICT-1', '2026-10-13 16:10:24');

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `record_id` bigint(20) UNSIGNED DEFAULT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `parent_name` varchar(150) NOT NULL,
  `meeting_date` date NOT NULL,
  `meeting_time` time NOT NULL,
  `venue` varchar(150) NOT NULL DEFAULT 'Prefect of Discipline Office',
  `status` varchar(30) NOT NULL DEFAULT 'Scheduled',
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `records`
--

CREATE TABLE `records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `violation_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reported_by_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reported_by_type` varchar(20) DEFAULT 'admin',
  `reported_by_name` varchar(150) DEFAULT NULL,
  `date_reported` datetime NOT NULL DEFAULT current_timestamp(),
  `status` varchar(30) NOT NULL DEFAULT 'Pending',
  `approval_status` varchar(30) NOT NULL DEFAULT 'Approved',
  `approved_by` varchar(150) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejected_by` varchar(150) DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `sanction` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `resolution_date` datetime DEFAULT NULL,
  `sms_notified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `records`
--

INSERT INTO `records` (`id`, `student_id`, `violation_id`, `reported_by_id`, `reported_by_type`, `reported_by_name`, `date_reported`, `status`, `approval_status`, `approved_by`, `approved_at`, `rejected_by`, `rejected_at`, `rejection_reason`, `sanction`, `remarks`, `resolution_notes`, `resolution_date`, `sms_notified`, `created_at`) VALUES
(1, 7, 101, 1, 'admin', 'System Administrator', '2026-10-13 16:05:33', 'Pending', 'Approved', 'System Administrator', '2026-10-13 16:05:33', NULL, NULL, NULL, 'Disciplinary Board Hearing & Suspension, 1st Offense: Written Reprimand, Parent Summons & Guidance Counseling', 'Disciplinary incident report logged. [GPS: 14.6077, 121.0463 (±20000m)]', NULL, NULL, 0, '2026-10-13 16:05:33'),
(2, 7, 49, 1, 'admin', 'System Administrator', '2026-10-13 16:05:33', 'Pending', 'Approved', 'System Administrator', '2026-10-13 16:05:33', NULL, NULL, NULL, 'Disciplinary Board Hearing & Suspension, 1st Offense: Written Reprimand, Parent Summons & Guidance Counseling', 'Disciplinary incident report logged. [GPS: 14.6077, 121.0463 (±20000m)]', NULL, NULL, 0, '2026-10-13 16:05:33'),
(3, 7, 51, 1, 'admin', 'System Administrator', '2026-10-13 16:05:33', 'Pending', 'Approved', 'System Administrator', '2026-10-13 16:05:33', NULL, NULL, NULL, 'Disciplinary Board Hearing & Suspension, 1st Offense: Written Reprimand, Parent Summons & Guidance Counseling', 'Disciplinary incident report logged. [GPS: 14.6077, 121.0463 (±20000m)]', NULL, NULL, 0, '2026-10-13 16:05:33'),
(4, 7, 75, 1, 'admin', 'System Administrator', '2026-10-13 16:05:33', 'Pending', 'Approved', 'System Administrator', '2026-10-13 16:05:33', NULL, NULL, NULL, 'Disciplinary Board Hearing & Suspension, 1st Offense: Written Reprimand, Parent Summons & Guidance Counseling', 'Disciplinary incident report logged. [GPS: 14.6077, 121.0463 (±20000m)]', NULL, NULL, 0, '2026-10-13 16:05:33'),
(5, 7, 76, 1, 'admin', 'System Administrator', '2026-10-13 16:05:33', 'Pending', 'Approved', 'System Administrator', '2026-10-13 16:05:33', NULL, NULL, NULL, 'Disciplinary Board Hearing & Suspension, 1st Offense: Written Reprimand, Parent Summons & Guidance Counseling', 'Disciplinary incident report logged. [GPS: 14.6077, 121.0463 (±20000m)]', NULL, NULL, 0, '2026-10-13 16:05:33'),
(6, 7, 77, 1, 'admin', 'System Administrator', '2026-10-13 16:05:33', 'Pending', 'Approved', 'System Administrator', '2026-10-13 16:05:33', NULL, NULL, NULL, 'Disciplinary Board Hearing & Suspension, 1st Offense: Written Reprimand, Parent Summons & Guidance Counseling', 'Disciplinary incident report logged. [GPS: 14.6077, 121.0463 (±20000m)]', NULL, NULL, 0, '2026-10-13 16:05:33');

-- --------------------------------------------------------

--
-- Table structure for table `school_events`
--

CREATE TABLE `school_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date NOT NULL,
  `time` varchar(100) NOT NULL DEFAULT '',
  `location` varchar(200) NOT NULL DEFAULT '',
  `category` varchar(50) NOT NULL DEFAULT 'academic',
  `categoryLabel` varchar(100) NOT NULL DEFAULT 'Academic',
  `color` varchar(20) NOT NULL DEFAULT '#07345f',
  `attendees` varchar(200) NOT NULL DEFAULT 'All Students',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(30) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role` varchar(20) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `token_hash`, `user_id`, `role`, `expires_at`, `created_at`) VALUES
('cmv89ztms0002vwlovkk9vmq4', '54c3f2cf52b46f587fe804eebed4e2e2467de8e39151249254c6b892add5ab95', 1, 'admin', '2026-10-14 17:02:30', '2026-10-14 15:39:39'),
('cmv8bk31m0000vwjw1pzoan3u', 'c74b9823badde6f3bc80a2340ab526eb8a4dea627a78d44a2bd0318c9c00735b', 1, 'admin', '2026-10-14 17:01:56', '2026-10-14 16:23:24');

-- --------------------------------------------------------

--
-- Table structure for table `sms_logs`
--

CREATE TABLE `sms_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `record_id` bigint(20) UNSIGNED DEFAULT NULL,
  `recipient_name` varchar(150) DEFAULT NULL,
  `phone_number` varchar(30) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Sent',
  `sent_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `fname` varchar(100) NOT NULL,
  `mname` varchar(100) NOT NULL DEFAULT '',
  `lname` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL DEFAULT '',
  `grade` varchar(20) NOT NULL,
  `section` varchar(50) NOT NULL,
  `academicyear` varchar(20) NOT NULL DEFAULT '2025-2026',
  `gender` varchar(10) NOT NULL DEFAULT 'Male',
  `contact` varchar(30) NOT NULL DEFAULT '',
  `parent_name` varchar(150) NOT NULL DEFAULT '',
  `parent_contact` varchar(30) NOT NULL DEFAULT '',
  `address` text DEFAULT NULL,
  `image` longtext DEFAULT NULL,
  `track` varchar(50) NOT NULL DEFAULT 'JHS',
  `strand` varchar(100) NOT NULL DEFAULT 'JHS',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `student_id`, `fname`, `mname`, `lname`, `email`, `grade`, `section`, `academicyear`, `gender`, `contact`, `parent_name`, `parent_contact`, `address`, `image`, `track`, `strand`, `created_at`) VALUES
(1, '23-0912-456', 'Jasmine', 'Rose', 'Castillo', '', 'Grade 9', 'JHS Core', '2025-2026', 'Male', 'Female', '09156667788', 'Lita Castillo', '', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'JHS', 'JHS', '2026-10-12 19:53:33'),
(2, '22-3693-693', 'Gabriel', 'Luis', 'Torres', '', 'Grade 10', 'JHS Core', '2025-2026', 'Male', 'Male', '09153334455', 'Ramon Torres', '', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 'JHS', 'JHS', '2026-10-12 19:53:33'),
(3, '22-3434-567', 'Alexander', 'Cruz', 'Mendoza', '', 'Grade 10', 'JHS Core', '2025-2026', 'Male', 'N/A', 'N/A', 'Carlos Mendoza', '', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', 'JHS', 'JHS', '2026-10-12 19:53:33'),
(4, '22-2468-024', 'Sophia', 'Grace', 'Villanueva', '', 'Grade 10', 'JHS Core', '2025-2026', 'Male', 'Female', '09152223344', 'Lorena Villanueva', '', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', 'JHS', 'JHS', '2026-10-12 19:53:33'),
(5, '22-0987-654', 'Christian', 'Paul', 'Navarro', '', 'Grade 11', 'STEM', '2025-2026', 'Male', 'Male', '09155556677', 'Dennis Navarro', '', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 'Arts & Design Track', 'GAS', '2026-10-12 19:53:33'),
(6, '22-1234-567', 'Isabella', 'Marie', 'Ramos', '', 'Grade 11', 'STEM', '2025-2026', 'Male', 'Female', '09154445566', 'Patricia Ramos', '', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Sports Track', 'Sports', '2026-10-12 19:53:33'),
(7, '22-0962-208', 'Ber Andrei', 'Sagun', 'Carpio', '', 'Grade 12', 'ICT-1', '2025-2026', 'Male', 'Male', '09669165414', 'Adelaida Abalos Sagun', '', 'data:image/jpeg;base64,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', 'Technical-Vocational-Livelihood (TVL)', 'TVL - ICT', '2026-10-12 19:53:33'),
(8, '109283746201', 'Danilo', 'G.', 'Ramos', 'danilo.ramos@viotrack.edu', 'Grade 10', 'Rizal', '2025-2026', 'Male', '09151234567', 'Arturo Ramos', '09151234568', 'Manila', '', 'JHS', 'Junior High School', '2026-10-13 17:12:19');

-- --------------------------------------------------------

--
-- Table structure for table `student_locations`
--

CREATE TABLE `student_locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(11,7) NOT NULL,
  `accuracy_meters` int(11) NOT NULL DEFAULT 10,
  `tracking_status` varchar(50) NOT NULL DEFAULT 'Active',
  `reported_by` varchar(150) NOT NULL DEFAULT 'System',
  `recorded_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fname` varchar(100) NOT NULL,
  `mname` varchar(100) NOT NULL DEFAULT '',
  `lname` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `position` varchar(100) NOT NULL DEFAULT 'Teacher I',
  `department` varchar(100) NOT NULL DEFAULT 'Junior High School',
  `contact` varchar(30) NOT NULL DEFAULT '',
  `gender` varchar(10) NOT NULL DEFAULT 'Male',
  `image` longtext DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `specialization` varchar(150) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `fname`, `mname`, `lname`, `email`, `password_hash`, `position`, `department`, `contact`, `gender`, `image`, `created_at`, `specialization`) VALUES
(2, 'Anna Liza', '', 'Villanueva', 'teacher1@viotrack.edu', '$2b$12$IRtjR6dfI2JvvxrAC8hcF.adoaA.LvoposNhM7ZQN0lQGjF7Xvto.', 'Teacher I', 'Senior High Faculty', '0987654321', 'Male', 'data:image/jpeg;base64,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', '2026-10-13 16:09:46', '');

-- --------------------------------------------------------

--
-- Table structure for table `violations`
--

CREATE TABLE `violations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `type` varchar(30) NOT NULL DEFAULT 'Minor',
  `severity` varchar(30) DEFAULT 'Minor',
  `default_sanction` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `violations`
--

INSERT INTO `violations` (`id`, `title`, `description`, `type`, `severity`, `default_sanction`, `created_at`) VALUES
(49, 'Uniform not worn or worn improperly', 'Student did not follow the proper uniform guidelines.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(50, 'School ID not worn properly', 'Student failed to wear or display their ID as required.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(51, 'Playing non-educational games', 'Student used devices to play games unrelated to schoolwork.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(52, 'Sleeping during class or activities', 'Student was caught sleeping during lessons or activities.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(53, 'Borrowing or lending money', 'Student engaged in borrowing or lending money on campus.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(54, 'Loitering or shouting in hallways', 'Student caused disturbance by roaming or shouting in hallways.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(55, 'Leaving classroom messy', 'Student did not clean up their area or left trash behind.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(56, 'Use of mobile gadgets without permission', 'Student used a mobile device without teacher authorization.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(57, 'Excessive jewelry or inappropriate appearance', 'Student wore accessories not allowed by the dress code.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(58, 'Wearing inappropriate clothing', 'Student wore attire that is not allowed in school.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(59, 'Using vulgar language', 'Student used inappropriate or offensive language.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(60, 'Minor bullying or teasing', 'Student engaged in light bullying, teasing, or mockery.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(61, 'Fighting or causing disturbances', 'Student caused minor physical or verbal disturbances.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(62, 'Horseplay inside classroom', 'Student participated in rough or playful actions inside class.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(63, 'Making inappropriate jokes', 'Student shared jokes that were inappropriate or offensive.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(64, 'Not completing clearance requirements', 'Student failed to accomplish clearance tasks on time.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(65, 'Taking food without consent', 'Student took food items without permission from the owner.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(66, 'Not joining required school activities', 'Student refused to join mandatory school events.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(67, 'Chewing gum or spitting in public', 'Student chewed gum or spat in prohibited areas.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(68, 'Buying food during class hours', 'Student left class or bought food when not allowed.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(69, 'Using school properties without permission', 'Student used school equipment without approval.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(70, 'Forging parent\'s signature', 'Student wrote a fake parent or guardian signature.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(71, 'Misbehavior in the canteen', 'Student acted disruptively in the school canteen.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(72, 'Disturbing class sessions', 'Student interrupted or distracted ongoing classes.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(73, 'Unauthorized playing in the gym', 'Student used the gym facilities without permission.', 'Minor', 'Minor', '1st Offense: Written Reprimand', '2026-10-14 00:04:20'),
(74, 'Cheating or academic dishonesty', 'Student engaged in cheating or dishonest academic practices.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(75, 'Plagiarism', 'Student submitted work copied from others without credit.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(76, 'Rough or dangerous play', 'Student engaged in actions that could harm others.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(77, 'Lying or misleading statements', 'Student intentionally gave false or misleading information.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(78, 'Possession of smoking items', 'Student possessed cigarettes, vapes, or related items.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(79, 'Vulgar or malicious acts', 'Student committed vulgar or offensive acts towards others.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(80, 'Bribery or dishonest acts', 'Student attempted to bribe or engage in dishonest conduct.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(81, 'Theft or aiding theft', 'Student stole or helped others steal property.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(82, 'Gambling or unauthorized collection', 'Student participated in gambling or unapproved fundraising.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(83, 'Not delivering official communications', 'Student failed to deliver important school notices.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(84, 'Rude behavior to visitors or parents', 'Student acted disrespectfully toward guests or parents.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(85, 'Disrespect to school authorities', 'Student disobeyed or disrespected teachers or staff.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(86, 'Use of vulgar language repeatedly', 'Student repeatedly used offensive or vulgar language.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(87, 'Causing chaos during events', 'Student created disorder during school programs.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(88, 'Disrespect during flag ceremonies', 'Student behaved improperly during the flag ceremony.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(89, 'Property damage from mischief', 'Student caused damage to school property due to misbehavior.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(90, 'Skipping class / truancy', 'Student was absent from class without valid reason.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(91, 'Entering/exiting without permission', 'Student entered or left the campus without authorization.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(92, 'Public display of affection', 'Student engaged in PDA on school grounds.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(93, 'Minor vandalism', 'Student committed small-scale vandalism.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(94, 'Posting unauthorized notices', 'Student posted materials on bulletin boards without approval.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(95, 'Posting offensive content online', 'Student posted inappropriate or harmful content online.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(96, 'Removing school announcements', 'Student removed or tampered with posted school announcements.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(97, 'Gang-like behavior', 'Student displayed behavior associated with gangs.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(98, 'Cyberbullying', 'Student bullied or harassed others online.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(99, 'Gross misconduct', 'Student engaged in unacceptable or highly improper behavior.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling', '2026-10-14 00:04:20'),
(100, 'Forgery or document tampering', 'Student altered or falsified official documents.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(101, 'Using fake receipts or forms', 'Student used forged receipts or falsified school forms.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(102, 'Major vandalism', 'Student caused significant damage to school property.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(103, 'Physical assault', 'Student physically harmed another student or staff.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(104, 'Stealing school or class funds', 'Student stole money belonging to the school or class.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(105, 'Extortion or blackmail', 'Student attempted to extort or blackmail another individual.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(106, 'Immoral or scandalous behavior', 'Student engaged in highly inappropriate behavior.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(107, 'Possessing pornography', 'Student possessed explicit or pornographic material.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(108, 'Criminal charges or conviction', 'Student is involved in criminal activity.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(109, 'Harassment of students/staff', 'Student harassed or intimidated others on campus.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(110, 'Causing injury requiring hospitalization', 'Student caused injuries that required medical treatment.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(111, 'Sexual harassment', 'Student committed acts of sexual harassment or misconduct.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(112, 'Lewd or immoral acts', 'Student participated in obscene or indecent behavior.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(113, 'Inappropriate social media use', 'Student posted harmful or inappropriate content online.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(114, 'Leaking confidential school info', 'Student disclosed confidential school information.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(115, 'Misusing school logo or name', 'Student used the school logo/name without authorization.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(116, 'Bribing school officials', 'Student attempted to bribe school staff or personnel.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(117, 'Drinking alcohol in school', 'Student consumed or possessed alcohol on school grounds.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(118, 'Drug-related activities', 'Student possessed or used illegal drugs.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(119, 'Bringing deadly weapons', 'Student brought dangerous weapons into school.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20'),
(120, 'Joining fraternities/sororities', 'Student participated in prohibited fraternity or sorority groups.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension', '2026-10-14 00:04:20');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('0ce0a2a6-684e-4bfa-ac03-16c1a957b194', 'f22176ef7124f1dea5147c4d93c5048ab795c246bc22dd09cb980d9d25017d46', '2026-10-13 10:21:34.355', '20261013010000_staff_academic_fields', NULL, NULL, '2026-10-13 10:21:34.259', 1),
('204fa019-aa82-4096-8b62-8227294ed8ed', '56af3e76eb6e57879b45c6a610713f6e66ace1d34116e59c48a24cd0dbd4ea46', '2026-10-12 19:38:48.228', '20261013000000_initial', '', NULL, '2026-10-12 19:38:48.228', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_logs_created_at_idx` (`created_at`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admins_email_key` (`email`);

--
-- Indexes for table `advisers`
--
ALTER TABLE `advisers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `advisers_grade_level_class_section_key` (`grade_level`,`class_section`),
  ADD KEY `advisers_teacher_id_fkey` (`teacher_id`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `meetings_record_id_fkey` (`record_id`),
  ADD KEY `meetings_student_id_fkey` (`student_id`);

--
-- Indexes for table `records`
--
ALTER TABLE `records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `records_status_idx` (`status`),
  ADD KEY `records_approval_status_idx` (`approval_status`),
  ADD KEY `records_date_reported_idx` (`date_reported`),
  ADD KEY `records_student_id_fkey` (`student_id`),
  ADD KEY `records_violation_id_fkey` (`violation_id`);

--
-- Indexes for table `school_events`
--
ALTER TABLE `school_events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sessions_token_hash_key` (`token_hash`),
  ADD KEY `sessions_expires_at_idx` (`expires_at`);

--
-- Indexes for table `sms_logs`
--
ALTER TABLE `sms_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sms_logs_student_id_fkey` (`student_id`),
  ADD KEY `sms_logs_record_id_fkey` (`record_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `students_student_id_key` (`student_id`),
  ADD KEY `students_grade_section_idx` (`grade`,`section`),
  ADD KEY `students_lname_fname_idx` (`lname`,`fname`);

--
-- Indexes for table `student_locations`
--
ALTER TABLE `student_locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_locations_student_id_recorded_at_idx` (`student_id`,`recorded_at`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `teachers_email_key` (`email`);

--
-- Indexes for table `violations`
--
ALTER TABLE `violations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `violations_type_idx` (`type`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `advisers`
--
ALTER TABLE `advisers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `records`
--
ALTER TABLE `records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `school_events`
--
ALTER TABLE `school_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sms_logs`
--
ALTER TABLE `sms_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `student_locations`
--
ALTER TABLE `student_locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `violations`
--
ALTER TABLE `violations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `advisers`
--
ALTER TABLE `advisers`
  ADD CONSTRAINT `advisers_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `meetings`
--
ALTER TABLE `meetings`
  ADD CONSTRAINT `meetings_record_id_fkey` FOREIGN KEY (`record_id`) REFERENCES `records` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `meetings_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `records`
--
ALTER TABLE `records`
  ADD CONSTRAINT `records_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `records_violation_id_fkey` FOREIGN KEY (`violation_id`) REFERENCES `violations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `sms_logs`
--
ALTER TABLE `sms_logs`
  ADD CONSTRAINT `sms_logs_record_id_fkey` FOREIGN KEY (`record_id`) REFERENCES `records` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `sms_logs_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student_locations`
--
ALTER TABLE `student_locations`
  ADD CONSTRAINT `student_locations_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
